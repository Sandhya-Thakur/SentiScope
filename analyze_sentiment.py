import sys
import json
import pickle
import re

def clean_text(text):
    """Clean text for prediction"""
    text = text.lower()
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def analyze_sentiment(text):
    # Load the model and vectorizer
    with open('sentiment_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('tfidf_vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    
    # Clean the text
    cleaned_text = clean_text(text)
    
    # Transform using vectorizer
    features = vectorizer.transform([cleaned_text])
    
    # Predict
    prediction = model.predict(features)[0]
    
    # Get probability/confidence
    proba = model.predict_proba(features)[0]
    confidence = float(proba[1] if prediction == 1 else proba[0])
    
    # Return results
    sentiment = "Positive" if prediction == 1 else "Negative"
    
    return {
        "text": text,
        "sentiment": sentiment,
        "confidence": confidence,
        "confidence_level": "high" if confidence > 0.8 else "moderate" if confidence > 0.6 else "low"
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = analyze_sentiment(input_text)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No text provided"}))