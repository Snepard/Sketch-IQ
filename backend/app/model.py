import torch
import threading
from app.cnn import SketchIQCNN

MODEL_PATH = "model/sketch_iq_extended.pt"

device = torch.device("cpu")

model_lock = threading.Lock()

model = SketchIQCNN(num_classes=25)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()
