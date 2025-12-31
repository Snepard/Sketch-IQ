import torch
import torch.nn.functional as F
from app.model import model, model_lock
from app.classes import CLASSES

def predict_doodle(image_tensor):
    with torch.no_grad():
        with model_lock:
            outputs = model(image_tensor)
            probs = F.softmax(outputs, dim=1)[0]

    top_probs, top_idxs = torch.topk(probs, 3)

    predictions = []
    for prob, idx in zip(top_probs, top_idxs):
        predictions.append({
            "label": CLASSES[idx.item()],
            "confidence": round(prob.item() * 100, 2)
        })

    return predictions
