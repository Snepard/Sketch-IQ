import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split

from dataset import QuickDrawDataset
from dataset import CLASSES

from model import SketchIQCNN

# -----------------------------
# Configuration
# -----------------------------
BATCH_SIZE = 64
EPOCHS = 15
LEARNING_RATE = 0.001
DATA_DIR = "data"
MODEL_SAVE_PATH = "sketch_iq_extended.pt"

# -----------------------------
# Device (CPU / GPU)
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# -----------------------------
# Load Dataset
# -----------------------------
dataset = QuickDrawDataset(DATA_DIR, samples_per_class=10000)

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_data, val_data = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_data, batch_size=BATCH_SIZE)

# -----------------------------
# Model, Loss, Optimizer
# -----------------------------
model = SketchIQCNN(num_classes=len(CLASSES)).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# -----------------------------
# Training Loop
# -----------------------------
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    avg_loss = running_loss / len(train_loader)

    # -----------------------------
    # Validation
    # -----------------------------
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total

    print(f"Epoch [{epoch+1}/{EPOCHS}] | Loss: {avg_loss:.4f} | Val Accuracy: {accuracy:.2f}%")

# -----------------------------
# Save Model
# -----------------------------
torch.save(model.state_dict(), MODEL_SAVE_PATH)
print("Model saved as", MODEL_SAVE_PATH)
