import cv2
import numpy as np
import torch
from PIL import Image
import io


def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    image = np.array(image)

    # Crop drawing
    coords = np.column_stack(np.where(image < 255))
    if coords.size:
        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0)
        image = image[y0 : y1 + 1, x0 : x1 + 1]

    # Resize
    image = cv2.resize(image, (28, 28))

    # Binary threshold (MATCH QUICK DRAW)
    _, image = cv2.threshold(image, 200, 255, cv2.THRESH_BINARY_INV)

    # Normalize
    image = image.astype("float32") / 255.0

    # Torch tensor
    image = torch.from_numpy(image).unsqueeze(0).unsqueeze(0)

    return image
