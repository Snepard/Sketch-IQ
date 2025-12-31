import os
import torch
import threading
from app.cnn import SketchIQCNN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "sketch_iq_extended.pt")

device = torch.device("cpu")

model_lock = threading.Lock()

model = SketchIQCNN(num_classes=25)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()
