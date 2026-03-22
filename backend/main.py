import requests
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

# -------------------------------
# LOAD ENV
# -------------------------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API_KEY
print("RESEND_API_KEY loaded:", bool(RESEND_API_KEY))

SQUARE_ACCESS_TOKEN = os.getenv("EAAAl46R1b6zlgwsSBsts08TOFVC_wDC_Zt15NZ6GWVWlyKTD4TsHrmmXvR3-RR3")
SQUARE_LOCATION_ID = os.getenv("sandbox-sq0idb-Gj2as9aFL6MwS_xODwfeVg")
SQUARE_API_BASE = "https://connect.squareupsandbox.com/v2"

MONGO_URI = os.getenv("MONGO_URI")
GNEWS_KEY = os.getenv("GNEWS_API_KEY")

# -------------------------------
# FASTAPI INIT
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(MONGO_URI)
db = client.plantdoc
users_collection = db.users

otp_store = {}

# -------------------------------
# EMAIL OTP
# -------------------------------
def send_email_otp(to_email: str, otp: str):
    try:
        if not RESEND_API_KEY:
            print("❌ RESEND_API_KEY missing")
            return
        resend.Emails.send({
            "from": "PlantDoc AI <plantdoc@resend.dev>",
            "to": to_email,
            "subject": "Your PlantDoc OTP",
            "text": f"Your OTP: {otp} (valid 10min)",
            "html": f"""
            <h2 style="color: #4CAF50;">Your PlantDoc Login OTP</h2>
            <p style="font-size:36px;font-weight:bold;color:#2196F3;">{otp}</p>
            <p>Valid for <strong>10 minutes</strong></p>
            <hr>
            <p style="color:#94a3b8;">Team PlantDoc</p>
            """
        })
        print(f"✅ OTP sent to {to_email}")
    except Exception as e:
        print(f"⚠ Email failed: {e}")

@app.post("/send-otp")
async def send_otp(background_tasks: BackgroundTasks, email: str = Form(...)):
    email = email.strip().lower()
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    background_tasks.add_task(send_email_otp, email, otp)
    return {"message": "OTP sent", "email": email}

@app.post("/verify-otp")
async def verify_otp(email: str = Form(...), otp: str = Form(...)):
    email = email.strip().lower()
    if otp_store.get(email) == otp.strip():
        otp_store.pop(email, None)
        return {"message": "OTP verified"}
    raise HTTPException(status_code=400, detail="Invalid/expired OTP")

# -------------------------------
# SIGNUP / LOGIN / RESET
# -------------------------------
@app.post("/signup")
async def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    email = email.strip().lower()
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email exists")
    users_collection.insert_one({"name": name.strip(), "email": email, "password": password, "purchasedItems": []})
    return {"message": "Signup successful"}

@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    email = email.strip().lower()
    user = users_collection.find_one({"email": email})
    if not user or user["password"] != password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"name": user["name"], "email": user["email"], "purchasedItems": user.get("purchasedItems", [])}

@app.post("/reset-password")
async def reset_password(email: str = Form(...), new_password: str = Form(...)):
    email = email.strip().lower()
    if not users_collection.find_one({"email": email}):
        raise HTTPException(status_code=404, detail="User not found")
    users_collection.update_one({"email": email}, {"$set": {"password": new_password}})
    return {"message": "Password updated"}

# -------------------------------
# PLANT DISEASE MODEL
# -------------------------------
class_data = {
    "Pepper__bell___Bacterial_spot": {"plant":"Pepper","disease":"Bacterial Spot","symptoms":["Brown spots on leaves"],"treatment":["Use copper fungicide"],"prevention":["Remove infected leaves"],"additionalInfo":"Caused by Xanthomonas campestris"},
    "Pepper__bell___healthy": {"plant":"Pepper","disease":"Healthy","symptoms":[],"treatment":[],"prevention":[],"additionalInfo":"No disease detected"},
    "Potato___Early_blight": {"plant":"Potato","disease":"Early Blight","symptoms":["Dark brown concentric spots"],"treatment":["Chlorothalonil fungicide"],"prevention":["Rotate crops"],"additionalInfo":"Alternaria solani fungus"},
    "Potato___Late_blight": {"plant":"Potato","disease":"Late Blight","symptoms":["Dark lesions, white mold"],"treatment":["Mancozeb fungicide"],"prevention":["Resistant varieties"],"additionalInfo":"Phytophthora infestans"},
    "Potato___healthy": {"plant":"Potato","disease":"Healthy","symptoms":[],"treatment":[],"prevention":[],"additionalInfo":"No disease detected"},
    "Tomato_Bacterial_spot": {"plant":"Tomato","disease":"Bacterial Spot","symptoms":["Small dark spots on leaves"],"treatment":["Copper fungicide"],"prevention":["Remove infected plants"],"additionalInfo":"Xanthomonas"},
    "Tomato_Early_blight": {"plant":"Tomato","disease":"Early Blight","symptoms":["Brown concentric spots"],"treatment":["Fungicide"],"prevention":["Crop rotation"],"additionalInfo":"Alternaria"},
    "Tomato_Late_blight": {"plant":"Tomato","disease":"Late Blight","symptoms":["Brown lesions"],"treatment":["Fungicide"],"prevention":["Resistant varieties"],"additionalInfo":"Phytophthora"},
    "Tomato_healthy": {"plant":"Tomato","disease":"Healthy","symptoms":[],"treatment":[],"prevention":[],"additionalInfo":"No disease detected"},
    "Tomato_Leaf_Mold": {"plant":"Tomato","disease":"Leaf Mold","symptoms":["Yellow spots under leaves"],"treatment":["Fungicide"],"prevention":["Avoid wet foliage"],"additionalInfo":"Passalora fulva"},
    "Tomato_Septoria_leaf_spot": {"plant":"Tomato","disease":"Septoria Leaf Spot","symptoms":["Small circular spots"],"treatment":["Remove infected leaves"],"prevention":["Crop rotation"],"additionalInfo":"Septoria lycopersici"},
    "Tomato_Spider_mites_Two_spotted_spider_mite": {"plant":"Tomato","disease":"Spider Mites","symptoms":["Yellow leaves, webbing"],"treatment":["Miticide"],"prevention":["Avoid dry stress"],"additionalInfo":"Tetranychus urticae"},
    "Tomato__Target_Spot": {"plant":"Tomato","disease":"Target Spot","symptoms":["Dark circular lesions"],"treatment":["Fungicide"],"prevention":["Crop rotation"],"additionalInfo":"Corynespora"},
    "Tomato__Tomato_mosaic_virus": {"plant":"Tomato","disease":"Mosaic Virus","symptoms":["Mottled leaves"],"treatment":["Remove infected plants"],"prevention":["Resistant varieties"],"additionalInfo":"TMV virus"},
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {"plant":"Tomato","disease":"Yellow Leaf Curl Virus","symptoms":["Yellow curling leaves"],"treatment":["Remove infected plants"],"prevention":["Resistant varieties"],"additionalInfo":"TYLCV virus"}
}

class_names = list(class_data.keys())
num_classes = len(class_names)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "plant_model.pt")
model = None

if os.path.exists(MODEL_PATH):
    try:
        temp_model = models.mobilenet_v2(weights=None)
        temp_model.classifier[1] = torch.nn.Linear(temp_model.classifier[1].in_features, num_classes)
        checkpoint = torch.load(MODEL_PATH, map_location=device)
        if 'classifier.1.weight' in checkpoint and checkpoint['classifier.1.weight'].shape[0] == num_classes:
            temp_model.load_state_dict(checkpoint)
            temp_model.to(device)
            temp_model.eval()
            model = temp_model
            print("✅ Model loaded successfully")
        else:
            print("⚠ Checkpoint mismatch")
    except Exception as e:
        print("❌ Error loading model:", e)
else:
    print("⚠ plant_model.pt not found")

transform = transforms.Compose([transforms.Resize((128,128)), transforms.ToTensor(), transforms.Normalize([0.5]*3,[0.5]*3)])

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
        info = class_data.get(key, {"plant": key.split("_")[0],"disease":"Unknown","symptoms":[],"treatment":[],"prevention":[],"additionalInfo":"No info"})
        return {"plant": info["plant"],"classKey": key,"diseases":[{"disease": info["disease"],"confidence": round(confidence.item()*100,2),"symptoms": info["symptoms"],"treatment": info["treatment"],"prevention": info["prevention"],"additionalInfo": info["additionalInfo"]}]}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# -------------------------------
# OFFLINE ORDER / COD
# -------------------------------
@app.post("/offline-order")
async def offline_order(data: dict = Body(...)):
    userEmail = data.get("userEmail","").strip().lower()
    order = data.get("order")
    user = users_collection.find_one({"email": userEmail})
    if not user: raise HTTPException(status_code=400, detail="User not found")
    users_collection.update_one({"email": userEmail},{"$push":{"purchasedItems":order}})
    return {"message":"Order placed (COD)"}

# -------------------------------
# SQUARE PAYMENT
# -------------------------------
@app.post("/create-square-payment")
async def create_square_payment(data: dict = Body(...)):
    if not SQUARE_ACCESS_TOKEN or not SQUARE_LOCATION_ID:
        raise HTTPException(status_code=500, detail="Square config missing")
    amount = int(data.get("amount",0))
    currency = data.get("currency","INR")
    product_name = data.get("productName")
    user_email = data.get("userEmail")
    body = {
        "idempotency_key": f"{user_email}-{random.randint(1000,9999)}",
        "order":{"location_id": SQUARE_LOCATION_ID,"line_items":[{"name": product_name,"quantity":"1","base_price_money":{"amount": amount*100,"currency":currency}}]},
        "ask_for_shipping_address": True,
        "redirect_url": "https://yourfrontend.com/payment-success"
    }
    headers = {"Square-Version":"2023-06-08","Authorization": f"Bearer {SQUARE_ACCESS_TOKEN}","Content-Type":"application/json"}
    response = requests.post(f"{SQUARE_API_BASE}/checkout", json=body, headers=headers)
    if response.status_code != 200: raise HTTPException(status_code=response.status_code, detail=response.text)
    checkout_data = response.json()
    checkout_url = checkout_data.get("checkout",{}).get("checkout_page_url")
    if not checkout_url: raise HTTPException(status_code=500, detail="Failed to create Square checkout")
    return {"checkoutUrl": checkout_url}

# -------------------------------
# AGRICULTURE NEWS
# -------------------------------
@app.get("/api/news")
async def get_agriculture_news():
    if not GNEWS_KEY: return {"articles": [], "totalResults":0, "message":"News config missing"}
    queries = ["India farmer news","Indian agriculture","farmers India"]
    url = "https://gnews.io/api/v4/search"
    for query in queries:
        try:
            r = requests.get(url, params={"q":query,"lang":"en","country":"in","max":15,"apikey":GNEWS_KEY}, timeout=10)
            if r.status_code==200 and r.json().get("articles"): return r.json()
        except: continue
    try:
        r = requests.get(url, params={"q":"news India","lang":"en","country":"in","max":10,"apikey":GNEWS_KEY}, timeout=10)
        return r.json()
    except: return {"articles": [], "totalResults":0, "message":"No news found"}

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)