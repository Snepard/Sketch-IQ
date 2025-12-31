import numpy as np
import torch
from torch.utils.data import Dataset

CLASSES = [
    "airplane", "ambulance", "angel", "ant", "anvil",
    "camera", "car", "cat", "circle", "clock",
    "cookie", "crown", "donut", "eye", "fish",
    "guitar", "hamburger", "parachute", "popsicle",
    "spider", "square", "star", "tent", "tree",
    "triangle"
]


class QuickDrawDataset(Dataset):
    def __init__(self, data_dir, samples_per_class=10000):
        self.images = []
        self.labels = []

        for idx, cls in enumerate(CLASSES):
            data = np.load(f"{data_dir}/{cls}.npy")
            data = data[:samples_per_class]

            data = data.reshape(-1, 28, 28)
            self.images.append(data)
            self.labels += [idx] * len(data)

        self.images = np.concatenate(self.images)
        self.images = self.images / 255.0
        self.images = torch.tensor(self.images, dtype=torch.float32).unsqueeze(1)
        self.labels = torch.tensor(self.labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.images[idx], self.labels[idx]
