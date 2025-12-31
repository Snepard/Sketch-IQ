from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.preprocess import preprocess_image
from app.predict import predict_doodle
from app.retrain import save_feedback_example
from app.classes import CLASSES

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = preprocess_image(image_bytes)

    predictions = predict_doodle(image)

    return {
        "predictions": predictions
    }


@router.post("/feedback")
async def feedback(
    file: UploadFile = File(...),
    label: str = Form(...),
):
    label = (label or "").strip().lower()
    if label not in CLASSES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Unknown label.",
                "allowed": CLASSES,
            },
        )

    image_bytes = await file.read()
    # Save for later inspection/retraining.
    save_feedback_example(image_bytes, label)

    # Intentionally NOT retraining immediately. A separate weekly job should
    # process stored feedback examples.
    return {"status": "stored"}
