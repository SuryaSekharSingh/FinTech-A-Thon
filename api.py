from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from pydantic import BaseModel
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
import torch.nn.functional as F
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load model and tokenizer
try:
    logger.info("Loading DistilBERT model and tokenizer...")
    model_path = "./scam-detection-model"  # Your model path
    tokenizer = DistilBertTokenizer.from_pretrained(model_path)
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    model.eval()
    
    # Use GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    logger.info(f"Model loaded successfully on {device}")

except Exception as e:
    logger.error(f"Model loading failed: {str(e)}")
    raise RuntimeError("Failed to initialize model") from e

# Define request/response models
class TextRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    prediction: str
    scam_probability: float
    device: str

# Initialize FastAPI
app = FastAPI(title="Scam Detection API", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific domain in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (OPTIONS, GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: TextRequest):
    try:
        # Tokenize input
        inputs = tokenizer(
            request.text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=512
        ).to(device)

        print(request.text)
        
        # Run inference
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Process results
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=-1).cpu().numpy()[0]
        prediction = torch.argmax(logits, dim=-1).item()
        scam_prob = probabilities[1]

        print("Probability: ",float(scam_prob))

        return {
            "prediction": "SCAM" if prediction == 1 else "NOT SCAM",
            "scam_probability": float(scam_prob),
            "device": str(device)
        }

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_device": str(device),
        "model_loaded": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5060)