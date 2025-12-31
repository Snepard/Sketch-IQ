# 🧠 Sketch IQ
**An AI-Powered Real-Time Doodle Guessing Game**

**Sketch IQ** is an immersive, interactive AI diversion where users render doodles on a digital canvas, and an intelligent neural network endeavors to **elucidate** the drawing in real-time. The project **harmonizes** machine learning, real-time inference, and contemporary UI/UX paradigms, strictly adhering to industry-standard full-stack deployment protocols.

---

## 🚀 Live Demo
- **Frontend (Next.js)**: Deployed on **Vercel**
- **Backend (FastAPI + ML)**: Deployed on **Render**

*(Insert live URLs here post-deployment)*

---

## ✨ Key Features

- 🎨 **Tactile Interface**: Interactive drawing canvas supporting both mouse and touch input.
- 🧠 **Neural Recognition**: AI-driven doodle identification utilizing a custom-trained CNN.
- ⏱ **Temporal Inference**: Live guessing mode where the AI updates its hypothesis every 2 seconds.
- ✅ **Definitive Submission**: A "Done" submission flow for the final, authoritative prediction.
- 🪟 **Modal Feedback**: Result popup displaying the prediction alongside a confidence metric.
- 🔁 **Iterative Loop**: User feedback mechanism (Correct/Wrong) to validate predictions.
- 📊 **Confidence-Aware UX**: The interface visually communicates the AI's uncertainty or assurance.
- 🧩 **Human-in-the-Loop**: A sophisticated design that leverages user input for future model refinement.
- ☁️ **Cloud Architecture**: Scalable deployment utilizing Vercel and Render.

---

## 🧠 Operational Mechanics

1. **Input Phase**: The user sketches a doodle on the canvas.
2. **Real-Time Analysis**:
   - The frontend intermittently transmits the canvas state to the backend.
   - The AI maintains a **“Guessing…”** status to avoid premature spoilers.
3. **Inference Execution**: Upon clicking **Done**:
   - The final composition is dispatched to the backend.
   - The AI predicts the most probable class with a calculated confidence score.
4. **Result Presentation**: A modal unveils:
   - The final classification.
   - The confidence percentage.
5. **Feedback Loop**:
   - ✅ **Correct**: The user proceeds to play again.
   - ❌ **Erroneous**: The user inputs the true label.
6. **Data Retention**: Incorrect predictions are archived for **future offline retraining**, creating a robust learning pipeline.

---

## 🧠 Machine Learning Pipeline

### Dataset
- Sourced from the Google **Quick Draw Dataset**.
- Comprises 25 distinct classes.
- 10,000 samples per class.
- Images are grayscale and standardized to **28×28** pixels.

### Model Architecture
- A bespoke **Convolutional Neural Network (CNN)**.
- Constructed and trained via **PyTorch**.
- Achieves ~91% validation accuracy.
- Meticulously optimized for **CPU-based inference**.

### Preprocessing Strategy
To ensure **congruence** between training and inference data, the pipeline employs:
- Grayscale conversion
- Bounding-box cropping
- Resizing to 28×28
- Binary thresholding
- Normalization

This rigorous preprocessing alignment is **paramount** for accurate real-time predictions.

---

## 🧩 Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Iconography**: Lucide Icons

### Backend
- **API Framework**: FastAPI
- **ML Framework**: PyTorch
- **Image Processing**: OpenCV, NumPy, Pillow

### Deployment Infrastructure
- **Frontend**: Vercel (Edge Network)
- **Backend**: Render (CPU-only inference environment)

---

## 🗂 Project Structure

```bash
Sketch-IQ/
├── frontend/             # Next.js Client Application
│   ├── app/
│   ├── components/
│   ├── utils/
│   └── page.tsx
│
├── backend/              # FastAPI Server & Inference Engine
│   ├── app/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── model.py
│   │   ├── cnn.py
│   │   └── predict.py
│   ├── model/
│   │   └── sketch_iq_extended.pt  # Serialized Model Weights
│   ├── requirements.txt
│   └── render.yaml
│
└── ml/                   # Model Training Scripts
    ├── train.py
    ├── dataset.py
    └── cnnBlueprint      # Architecture definition
```
---
## 🧪 Running Locally

To replicate the development environment on your local machine, follow these steps.

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and **ignite** the server.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend will be accessible at http://127.0.0.1:8000.

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies.

```bash
cd frontend
npm install
npm run dev
```
---
## 👤 Author

**Aryan Singh**   
*Computer Science Engineering Student*

⭐ If you find this project intriguing, consider bestowing a star!
