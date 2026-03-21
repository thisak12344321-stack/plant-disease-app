from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from PIL import Image
import torch
from torchvision import transforms, models
import random
import os
import resend
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ✅ CORRECT RESEND INITIALIZATION (module-level)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API_KEY  # ← THIS WORKS!

print("RESEND_API_KEY loaded:", bool(RESEND_API_KEY))
print(os.listdir())

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.plantdoc
users_collection = db.users

# OTP Store
otp_store = {}

# -------------------------------
# RESEND EMAIL FUNCTION (NO CLIENT NEEDED)
# -------------------------------
def send_email_otp(to_email: str, otp: str):
    """Send OTP via Resend API - Render free tier compatible"""
    try:
        if not RESEND_API_KEY:
            print("❌ RESEND_API_KEY missing - skipping email")
            return
            
        # ✅ CORRECT USAGE: resend.Emails.send()
        resend.Emails.send({
            "from": "PlantDoc AI <noreply@plantdoc.app>",
            "to": to_email,
            "subject": "Your PlantDoc Login OTP",
            "text": f"Your PlantDoc OTP is: {otp}\nValid for 10 minutes.",
            "html": f"""
            <h2 style="color: #4CAF50;">Your PlantDoc Login OTP</h2>
            <p style="font-size: 36px; font-weight: bold; color: #2196F3;">{otp}</p>
            <p>Valid for <strong>10 minutes</strong>.</p>
            <hr>
            <p style="color: #94a3b8;">Team PlantDoc</p>
            """
        })
        print(f"✅ OTP sent to {to_email}")
        
    except Exception as e:
        print(f"⚠️ Email failed: {e}")

# -------------------------------
# SEND OTP
# -------------------------------
@app.post("/send-otp")
async def send_otp(background_tasks: BackgroundTasks, email: str = Form(...)):
    email = email.strip().lower()
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    background_tasks.add_task(send_email_otp, email, otp)
    return {"message": "OTP sent instantly", "email": email}

# -------------------------------
# VERIFY OTP
# -------------------------------
@app.post("/verify-otp")
async def verify_otp(email: str = Form(...), otp: str = Form(...)):
    email = email.strip().lower()
    stored_otp = otp_store.get(email)
    
    if stored_otp and stored_otp == otp.strip():
        otp_store.pop(email, None)
        return {"message": "OTP verified successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid or expired OTP")

# -------------------------------
# SIGNUP
# -------------------------------
@app.post("/signup")
async def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    email = email.strip().lower()
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    users_collection.insert_one({
        "name": name.strip(),
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
    email = email.strip().lower()
    user = users_collection.find_one({"email": email})
    
    if not user or user["password"] != password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {
        "name": user["name"],
        "email": user["email"],
        "purchasedItems": user.get("purchasedItems", [])
    }

# -------------------------------
# RESET PASSWORD
# -------------------------------
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
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "plant_model.pt")
model = None

# SAFE MODEL LOADING
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
            print(f"⚠ Checkpoint has {ckpt_out_features} classes, expected {num_classes}")
    except Exception as e:
        print("❌ Error loading model:", e)
else:
    print("⚠ plant_model.pt not found")

transform = transforms.Compose([
    transforms.Resize((128,128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3)
])

# PREDICT ROUTE
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

        key = class_names[predicted.item()]
        info = class_data.get(key, {
            "plant": key.split("_")[0],
            "disease": "_".join(key.split("_")[1:]),
            "symptoms": [], "treatment": [], "prevention": [],
            "additionalInfo": "No information available"
        })

        return {
            "plant": info["plant"],
            "classKey": key,
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

# PURCHASE (RAZORPAY)
@app.post("/purchase")
async def purchase(userEmail: str = Body(...), product: dict = Body(...), paymentDetails: dict = Body(...)):
    userEmail = userEmail.strip().lower()
    user = users_collection.find_one({"email": userEmail})
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    users_collection.update_one({"email": userEmail}, {"$push": {"purchasedItems": product}})

    # Send confirmation email
    try:
        resend.Emails.send({
            "from": "PlantDoc AI <noreply@plantdoc.app>",
            "to": userEmail,
            "subject": f"Invoice for {product['name']}",
            "html": f"""
            <h2 style="color: #4CAF50;">Payment Successful! 🎉</h2>
            <h3>Order Details:</h3>
            <ul>
                <li><strong>Product:</strong> {product['name']}</li>
                <li><strong>Quantity:</strong> {product.get('quantity', 1)}</li>
                <li><strong>Total:</strong> ₹{product['totalAmount']}</li>
                <li><strong>Payment ID:</strong> {paymentDetails.get('razorpay_payment_id', 'N/A')}</li>
            </ul>
            <p>Thank you for your purchase!</p>
            """
        })
        print(f"✅ Purchase confirmation sent to {userEmail}")
    except Exception as e:
        print(f"⚠️ Purchase email failed: {e}")

    return {"message": "Purchase successful"}

# OFFLINE ORDER (COD)
@app.post("/offline-order")
async def offline_order(data: dict = Body(...)):
    userEmail = data.get("userEmail", "").strip().lower()
    order = data.get("order")
    
    user = users_collection.find_one({"email": userEmail})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    users_collection.update_one({"email": userEmail}, {"$push": {"purchasedItems": order}})
    return {"message": "Order placed successfully (COD)"}
