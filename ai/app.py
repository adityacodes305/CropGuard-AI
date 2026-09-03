from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://crop-guard-ai-self.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained YOLO model
model = YOLO("runs/classify/train/weights/best.pt")


@app.get("/")
def home():
    return {
        "message": "CropGuard AI service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "AI service is healthy"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    results = model(image)

    result = results[0]

    probs = result.probs

    # Top 5 predictions
    top5_ids = probs.top5
    top5_conf = probs.top5conf

    predictions = []

    for class_id, confidence in zip(top5_ids, top5_conf):

        raw_name = result.names[class_id]

        # Split Crop___Disease
        parts = raw_name.split("___", 1)

        crop = parts[0].replace("_", " ")

        disease = (
            parts[1].replace("_", " ")
            if len(parts) > 1
            else "Unknown"
        )

        # Clean disease name
        disease = disease.replace("(", "")
        disease = disease.replace(")", "")

        if disease.lower() == "healthy":
            status = "Healthy"
        else:
            status = "Disease Detected"

        predictions.append({
            "crop": crop,
            "disease": disease,
            "confidence": round(
                float(confidence) * 100,
                2
            ),
            "status": status
        })

    best = predictions[0]

    return {
        "crop": best["crop"],
        "disease": best["disease"],
        "confidence": best["confidence"],
        "status": best["status"],
        "top_predictions": predictions
    }