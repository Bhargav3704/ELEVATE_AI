from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import pickle
import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.optimizers import Adam  # ✅ Fix optimizer import

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # Allow requests from React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load the AI Model
model = tf.keras.models.load_model("sentiment_model_lstm_new.keras", compile=False)
model.compile(optimizer=Adam())  # ✅ Fix optimizer issue

# Load Tokenizer
with open("tokenizer (1).pickle", "rb") as handle:
    tokenizer = pickle.load(handle)

MAX_LEN = 100  # Ensure this matches training

class TextInput(BaseModel):
    text: str

@app.post("/predict")
async def predict_sentiment(data: TextInput):
    # Preprocess text
    seq = tokenizer.texts_to_sequences([data.text])
    padded_seq = pad_sequences(seq, maxlen=MAX_LEN, padding='post')

    # Predict sentiment
    prediction = model.predict(padded_seq)
    sentiment = 1 if prediction[0][0] > 0.5 else 0  # 0: Negative, 1: Positive
    print(f"Predicted Sentiment: {sentiment}", flush=True)
    return {"sentiment": sentiment}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
