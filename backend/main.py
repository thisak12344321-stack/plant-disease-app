from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from PIL import Image
from fastapi import BackgroundTasks
import torch
from torchvision import transforms, models
import random
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
print("EMAIL_USER:", EMAIL_USER)
print("EMAIL_PASS:", EMAIL_PASS)
print(os.listdir())
app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# ENV VARIABLES
# -------------------------------
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# -------------------------------
# MONGODB
# -------------------------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client.plantdoc
users_collection = db.users

# -------------------------------
# OTP STORE
# -------------------------------
otp_store = {}

# -------------------------------
# EMAIL FUNCTION
# -------------------------------
def send_email_otp(to_email, otp):
    try:
        if not EMAIL_USER or not EMAIL_PASS:
            raise Exception("Email credentials not set")

        sender_email = EMAIL_USER
        password = EMAIL_PASS

        msg = MIMEText(f"Your OTP is: {otp}")
        msg["Subject"] = "Login OTP"
        msg["From"] = sender_email
        msg["To"] = to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, msg.as_string())

    except Exception as e:
        print("EMAIL ERROR:", e)
        raise HTTPException(status_code=500, detail="Email failed")
# -------------------------------
# SEND OTP
# -------------------------------
from fastapi import BackgroundTasks

@app.post("/send-otp")
async def send_otp(background_tasks: BackgroundTasks, email: str = Form(...)):
    email = email.strip()
    otp = random.randint(100000, 999999)
    otp_store[email] = otp

    # 👇 send email in background
    background_tasks.add_task(send_email_otp, email, otp)

    return {"message": "OTP sent instantly"}
# -------------------------------
# VERIFY OTP
# -------------------------------
# Change otp: int to otp: str
@app.post("/verify-otp")
async def verify_otp(email: str = Form(...), otp: str = Form(...)):
    email = email.strip()
    # Convert the stored integer OTP to a string for comparison
    stored_otp = otp_store.get(email)
    
    if stored_otp and str(stored_otp) == otp.strip():
        otp_store.pop(email)
        return {"message": "OTP verified"}
        
    raise HTTPException(status_code=400, detail="Invalid OTP")
# -------------------------------
# SIGNUP
# -------------------------------
@app.post("/signup")
async def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    email = email.strip()
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email exists")
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "purchasedItems": []
    })
    return {"message": "Signup successful"}

# -------------------------------
# LOGIN
# -------------------------------
@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    email = email.strip()
    user = users_collection.find_one({"email": email})
    if not user or user["password"] != password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {
        "name": user["name"],
        "email": user["email"],
        "purchasedItems": user.get("purchasedItems", [])
    }
    

@app.post("/reset-password")
async def reset_password(email: str = Form(...), new_password: str = Form(...)):
    email = email.strip().lower()
    
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_collection.update_one(
        {"email": email},
        {"$set": {"password": new_password}}
    )
    return {"message": "Password updated successfully"}
# -------------------------------
# PLANT DISEASE MODEL
# -------------------------------
class_data = {
    "Pepper__bell___Bacterial_spot": {"plant":"Pepper", "disease":"Bacterial Spot", "symptoms":["Brown spots on leaves"], "treatment":["Use copper fungicide"], "prevention":["Remove infected leaves"], "additionalInfo":"Caused by Xanthomonas campestris"},
    "Pepper__bell___healthy": {"plant":"Pepper", "disease":"Healthy", "symptoms":[], "treatment":[], "prevention":[], "additionalInfo":"No disease detected"},
    "Potato___Early_blight": {"plant":"Potato", "disease":"Early Blight", "symptoms":["Dark brown concentric spots"], "treatment":["Chlorothalonil fungicide"], "prevention":["Rotate crops"], "additionalInfo":"Alternaria solani fungus"},
    "Potato___Late_blight": {"plant":"Potato", "disease":"Late Blight", "symptoms":["Dark lesions, white mold"], "treatment":["Mancozeb fungicide"], "prevention":["Resistant varieties"], "additionalInfo":"Phytophthora infestans"},
    "Potato___healthy": {"plant":"Potato", "disease":"Healthy", "symptoms":[], "treatment":[], "prevention":[], "additionalInfo":"No disease detected"},
    "Tomato_Bacterial_spot": {"plant":"Tomato","disease":"Bacterial Spot","symptoms":["Small dark spots on leaves"], "treatment":["Copper fungicide"], "prevention":["Remove infected plants"], "additionalInfo":"Xanthomonas"},
    "Tomato_Early_blight": {"plant":"Tomato","disease":"Early Blight","symptoms":["Brown concentric spots"], "treatment":["Fungicide"], "prevention":["Crop rotation"], "additionalInfo":"Alternaria"},
    "Tomato_Late_blight": {"plant":"Tomato","disease":"Late Blight","symptoms":["Brown lesions"], "treatment":["Fungicide"], "prevention":["Resistant varieties"], "additionalInfo":"Phytophthora"},
    "Tomato_healthy": {"plant":"Tomato","disease":"Healthy","symptoms":[], "treatment":[], "prevention":[], "additionalInfo":"No disease detected"},
    "Tomato_Leaf_Mold": {"plant":"Tomato","disease":"Leaf Mold","symptoms":["Yellow spots under leaves"], "treatment":["Fungicide"], "prevention":["Avoid wet foliage"], "additionalInfo":"Passalora fulva"},
    "Tomato_Septoria_leaf_spot": {"plant":"Tomato","disease":"Septoria Leaf Spot","symptoms":["Small circular spots"], "treatment":["Remove infected leaves"], "prevention":["Crop rotation"], "additionalInfo":"Septoria lycopersici"},
    "Tomato_Spider_mites_Two_spotted_spider_mite": {"plant":"Tomato","disease":"Spider Mites","symptoms":["Yellow leaves, webbing"], "treatment":["Miticide"], "prevention":["Avoid dry stress"], "additionalInfo":"Tetranychus urticae"},
    "Tomato__Target_Spot": {"plant":"Tomato","disease":"Target Spot","symptoms":["Dark circular lesions"], "treatment":["Fungicide"], "prevention":["Crop rotation"], "additionalInfo":"Corynespora"},
    "Tomato__Tomato_mosaic_virus": {"plant":"Tomato","disease":"Mosaic Virus","symptoms":["Mottled leaves"], "treatment":["Remove infected plants"], "prevention":["Resistant varieties"], "additionalInfo":"TMV virus"},
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {"plant":"Tomato","disease":"Yellow Leaf Curl Virus","symptoms":["Yellow curling leaves"], "treatment":["Remove infected plants"], "prevention":["Resistant varieties"], "additionalInfo":"TYLCV virus"}
}

class_names = list(class_data.keys())
num_classes = len(class_names)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "C:/Users/Khada/plant-disease-app/backend/model/plant_model.pt"
model = None

# -------------------------------
# SAFE MODEL LOADING
# -------------------------------
if os.path.exists(MODEL_PATH):
    try:
        temp_model = models.mobilenet_v2(weights=None)
        temp_model.classifier[1] = torch.nn.Linear(temp_model.classifier[1].in_features, num_classes)
        checkpoint = torch.load(MODEL_PATH, map_location=device)
        ckpt_out_features = checkpoint['classifier.1.weight'].shape[0] if 'classifier.1.weight' in checkpoint else None
        if ckpt_out_features == num_classes:
            temp_model.load_state_dict(checkpoint)
            temp_model.to(device)
            temp_model.eval()
            model = temp_model
            print("✅ Model loaded successfully")
        else:
            print(f"⚠ Checkpoint has {ckpt_out_features} classes, expected {num_classes}. Model not loaded but server will run.")
    except Exception as e:
        print("❌ Error loading model:", e, ". Server will run without model")
else:
    print("⚠ plant_model.pt not found. Server running without model.")

transform = transforms.Compose([
    transforms.Resize((128,128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3)
])

# -------------------------------
# PREDICT ROUTE
# -------------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        image = Image.open(file.file).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)

        # Get the predicted class key
        key = class_names[predicted.item()]
        info = class_data.get(key, {
            "plant": key.split("_")[0],
            "disease": "_".join(key.split("_")[1:]),
            "symptoms": [],
            "treatment": [],
            "prevention": [],
            "additionalInfo": "No information available"
        })

        return {
            "plant": info["plant"],
            "classKey": key,   # <-- send original class key for React mapping
            "diseases": [{
                "disease": info["disease"],
                "confidence": round(confidence.item() * 100, 2),
                "symptoms": info["symptoms"],
                "treatment": info["treatment"],
                "prevention": info["prevention"],
                "additionalInfo": info["additionalInfo"]
            }]
        }

    except Exception as e:
        print("❌ Predict error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
# -------------------------------
# ONLINE PURCHASE (RAZORPAY)
# -------------------------------
@app.post("/purchase")
async def purchase(userEmail: str = Body(...), product: dict = Body(...), paymentDetails: dict = Body(...)):
    userEmail = userEmail.strip()
    user = users_collection.find_one({"email": userEmail})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    users_collection.update_one({"email": userEmail},{"$push":{"purchasedItems":product}})

    try:
        sender_email = EMAIL_USER
        password = EMAIL_PASS
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Invoice for {product['name']}"
        msg["From"] = sender_email
        msg["To"] = userEmail

        html = f"""
        <h2>Payment Successful</h2>
        <p>Product: {product['name']}</p>
        <p>Quantity: {product['quantity']}</p>
        <p>Total: ₹{product['totalAmount']}</p>
        <p>Payment ID: {paymentDetails.get('razorpay_payment_id')}</p>
        """
        msg.attach(MIMEText(html,"html"))

        with smtplib.SMTP_SSL("smtp.gmail.com",465) as server:
            server.login(sender_email,password)
            server.sendmail(sender_email,userEmail,msg.as_string())
    except Exception as e:
        print("EMAIL ERROR:", e)

    return {"message":"Purchase successful"}

# -------------------------------
# OFFLINE ORDER (COD)
# -------------------------------
@app.post("/offline-order")
async def offline_order(data: dict = Body(...)):
    userEmail = data.get("userEmail")
    order = data.get("order")
    user = users_collection.find_one({"email": userEmail})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    users_collection.update_one({"email": userEmail},{"$push":{"purchasedItems":order}})
    return {"message":"Order placed (COD)"}
