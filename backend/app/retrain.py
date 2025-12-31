import threading
from pathlib import Path

import torch

from app.classes import CLASSES
from app.model import MODEL_PATH, model, model_lock


def save_feedback_example(image_bytes: bytes, label: str, base_dir: str = "feedback") -> Path:
    feedback_dir = Path(base_dir)
    feedback_dir.mkdir(parents=True, exist_ok=True)

    # Keep it simple: store raw image bytes + label in a sidecar txt.
    # (The incoming bytes are the canvas PNG.)
    stem = str(int(torch.randint(0, 2**31 - 1, (1,)).item()))
    img_path = feedback_dir / f"{stem}.png"
    label_path = feedback_dir / f"{stem}.label.txt"

    img_path.write_bytes(image_bytes)
    label_path.write_text(label, encoding="utf-8")
    return img_path


def fine_tune_on_example(image_tensor: torch.Tensor, label: str, steps: int = 25, lr: float = 1e-4) -> None:
    label = label.strip().lower()
    if label not in CLASSES:
        raise ValueError("Unknown label")

    target = torch.tensor([CLASSES.index(label)], dtype=torch.long)

    # Tiny, fast fine-tune on the single corrected example.
    # Runs under a lock to avoid concurrent mutation during prediction.
    with model_lock:
        was_training = model.training
        model.train()
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)
        loss_fn = torch.nn.CrossEntropyLoss()

        for _ in range(max(1, steps)):
            optimizer.zero_grad(set_to_none=True)
            logits = model(image_tensor)
            loss = loss_fn(logits, target)
            loss.backward()
            optimizer.step()

        model.eval()
        torch.save(model.state_dict(), MODEL_PATH)

        if was_training:
            model.train()
