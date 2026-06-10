from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import io
import json
import base64
import httpx 
import asyncio 
import os
import edge_tts 
import traceback 
import re
import random 
import time
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")

app = FastAPI(title="AI Dil Öğrenme Platformu Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=API_KEY)

class UretimIstegi(BaseModel):
    seviye: str
    tema: str
    sanat_tarzi: str
    ana_karakter: str = ""
    ozel_detay: str = ""

async def ses_uret_async(hikaye_metni):
    communicate = edge_tts.Communicate(hikaye_metni, "en-US-AriaNeural")
    ses_bellek = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            ses_bellek.write(chunk["data"])
            
    return base64.b64encode(ses_bellek.getvalue()).decode('utf-8')

async def gorsel_indir_async(gorsel_prompt, sanat_tarzi):
    raw_prompt = f"{gorsel_prompt}, {sanat_tarzi} style, wide angle shot, beautiful scenery, aesthetic environment, vibrant colors, storybook illustration, masterpiece, highly detailed"
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "prompt": raw_prompt
    }
    
    print("🎨 Cloudflare SDXL Görseli Çiziyor...")
    
    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(url, headers=headers, json=data, timeout=60.0)
        
        if response.status_code != 200:
            raise Exception(f"Cloudflare API Hatası: {response.text}")
            
        img_bytes = response.content
        return f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

@app.post("/api/uret")
async def icerik_uret(istek: UretimIstegi):
    try:
        karakter_metni = f"Baş karakterin adı '{istek.ana_karakter}' olmalıdır." if istek.ana_karakter else "Baş karakterin adını sen belirle."
        detay_metni = f"Kurguda şu unsurlar yer almalıdır: '{istek.ozel_detay}'." if istek.ozel_detay else "Rastgele kurgula."
        rastgele_tohum = random.randint(100000, 999999)

        prompt_birlestirilmis = f"""
        Sen yaratıcı bir İngilizce öğretmenisin. Öğrencinin seviyesi {istek.seviye} ve {istek.tema} temasına ilgi duyuyor.
        
        ÖZEL KURALLAR:
        - {karakter_metni}
        - {detay_metni}
        - Hikaye 300-400 kelime uzunluğunda, sürükleyici olmalı.
        - DİKKAT: Kullanıcı bu sistemi arka arkaya kullanıyor. KLİŞELERDEN KAÇIN! Her seferinde olay örgüsünü, mekanı, atmosferi ve hikayenin gidişatını %100 değiştir. Öngörülemez ol! (Varyasyon Tohumu: {rastgele_tohum})
        
        Aşağıdaki 3 veriyi TEK BİR JSON objesi olarak döndür:
        1. "hikaye": İngilizce uzun hikaye.
        2. "gorsel_prompt": Hikayenin geçtiği MEKANI anlatan İngilizce görsel tarifi (Maks. 10 kelime). Geniş açı olsun.
        3. "quiz": Hikayeye dayalı 3 soruluk quiz. "cevap" alanı, "secenekler" listesindeki doğru şıkkın BİREBİR AYNISI olmalıdır.
        
        Sadece geçerli bir JSON döndür. Başka hiçbir markdown kullanma.
        """
        
        print("▶ Adım 1: Gemini'dan Hikaye İsteniyor...")
        baslangic_gemini = time.time()
        
        response = await asyncio.to_thread(client.models.generate_content, model='gemini-2.5-flash', contents=prompt_birlestirilmis)
        
        bitis_gemini = time.time()
        print(f"⏱️ Gemini Tamamlandı: {bitis_gemini - baslangic_gemini:.2f} saniye")
        
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if not json_match:
            raise ValueError("Yapay Zeka JSON formatında cevap vermedi: " + response.text)
            
        uretilen_veri = json.loads(json_match.group(0), strict=False)
        
        print("▶ Adım 2: Ses (Edge) ve Görsel (Cloudflare) Paralel Üretiliyor...")
        baslangic_paralel = time.time()
        
        ses_gorevi = ses_uret_async(uretilen_veri["hikaye"])
        gorsel_gorevi = gorsel_indir_async(uretilen_veri["gorsel_prompt"], istek.sanat_tarzi)
        
        ses_base64, final_gorsel_url = await asyncio.gather(ses_gorevi, gorsel_gorevi)
        
        bitis_paralel = time.time()
        print(f"⏱️ Paralel İşlemler Tamamlandı: {bitis_paralel - baslangic_paralel:.2f} saniye")
        print(f"🚀 TOPLAM BACKEND SÜRESİ: {bitis_paralel - baslangic_gemini:.2f} saniye\n")
        
        return {
            "durum": "basarili",
            "hikaye": uretilen_veri["hikaye"],
            "gorsel_url": final_gorsel_url,
            "ses_base64": ses_base64,
            "quiz": uretilen_veri["quiz"]
        }

    except Exception as e:
        print("\n" + "="*40)
        print("!!! ÇÖKME RAPORU !!!")
        traceback.print_exc()
        print("="*40 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

class SozlukIstegi(BaseModel):
    kelime: str

@app.post("/api/sozluk")
async def kelime_cevir(istek: SozlukIstegi):
    try:
        prompt = f"Sen profesyonel bir İngilizce öğretmenisin. Öğrenci sana '{istek.kelime}' kelimesini sordu. Türkçe anlamını ve örnek cümlesini ver. Markdown kullanmadan düz metin olarak ver."
        response = await asyncio.to_thread(client.models.generate_content, model='gemini-2.5-flash', contents=prompt)
        return {"durum": "basarili", "anlam": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))