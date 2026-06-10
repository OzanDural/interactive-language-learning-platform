# AI-Powered Interactive Language Learning Platform: Story Weaver

This repository contains the complete source code for **AI Story Weaver**, an advanced web-based language learning platform developed as a Graduation Thesis project in the Computer Engineering Department at Çukurova University. 

The platform leverages generative artificial intelligence to deliver highly personalized, multimodal language learning experiences by dynamically generating level-specific stories, custom visual illustrations, neural audio narrations, and reading comprehension assessments.

---
## 📸 Application Screenshots
<img width="1104" height="536" alt="Ekran görüntüsü 2026-05-31 231658" src="https://github.com/user-attachments/assets/8526192b-c91b-4724-8e5d-f08cade4e0db" />

<img width="1094" height="537" alt="Ekran görüntüsü 2026-05-31 231712" src="https://github.com/user-attachments/assets/7cce0524-8dc2-437a-b1f6-050cb87f4a05" />

<img width="1303" height="898" alt="Ekran görüntüsü 2026-05-31 231906" src="https://github.com/user-attachments/assets/ec1a4f1c-fefc-45c8-8910-2242e06ea9b4" />

<img width="1042" height="886" alt="Ekran görüntüsü 2026-05-31 232009" src="https://github.com/user-attachments/assets/aea06689-c00a-494b-a4c0-b85cd68f9cd7" />

<img width="1029" height="897" alt="Ekran görüntüsü 2026-05-31 232046" src="https://github.com/user-attachments/assets/67f050f1-2fb5-4112-8e82-6d2733a14f1d" />

## 🚀 Key Features

- **Dynamic Content Generation:** Generates customized English stories based on CEFR levels (A1 to B2) and user-selected themes (Sci-Fi, Mystery, Daily Life, History).
- **Multimodal Learning Pipeline:** Integrates large language models, text-to-speech engines, and image generation models to create rich learning materials concurrently.
- **Asynchronous Parallel Execution:** Minimizes end-to-end response times by processing visual and auditory asset creation in parallel.
- **Interactive Reading Assessment:** Automatically builds context-aware multiple-choice quizzes with strict validation keys.
- **Smart Dictionary Integration:** Provides on-the-fly vocabulary assistance and translations without disrupting the user's reading flow.

---

## 🛠️ System Architecture & Tech Stack

The application is built using a modern decoupled Client-Server architecture:

- **Frontend:** React, Next.js (App Router), Tailwind CSS.
- **Backend:** Python 3.13, FastAPI (Asynchronous Framework), HTTPX, Asyncio.
- **AI Integration Core:**
  - **Text & Quiz Engine:** Google Gemini 2.5 Flash.
  - **Image Generation Engine:** Cloudflare Workers AI (Stability AI Stable Diffusion XL 1.0).
  - **Speech Synthesis Engine:** Microsoft Edge-TTS (Neural voice model: `en-US-AriaNeural`).

---

## 💻 Prerequisites (Windows Setup)

Ensure you have the following software installed on your Windows machine before proceeding:

1. **Python 3.13+** (Ensure "Add Python to PATH" is checked during installation)
2. **Node.js LTS** (v18 or v20+)
3. **Git**

---

## 🔧 Installation & Running the Application (Live Demo Guide)

To avoid directory errors, you must run the backend and frontend in **two separate terminal windows**. 

### 1. Backend Configuration & Startup (Terminal 1)
Open your first terminal (CMD or PowerShell) in the root directory of your project (where `backend.py` and the `.venv` folder are located).

```cmd
# Activate the virtual environment
.\.venv\Scripts\activate

# Install dependencies (First time only)
pip install fastapi uvicorn pydantic google-genai httpx edge-tts python-dotenv

# Start the FastAPI server
uvicorn backend:app --reload

The backend server is now running at: http://127.0.0.1:8000
```
### 2. Environment Variables (.env)
Ensure you have a .env file in the same directory as your backend with the following keys:

GEMINI_API_KEY=your_google_gemini_api_key_here

CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

### 3. Frontend Configuration & Startup (Terminal 2)
Open a second terminal window, navigate specifically to your frontend folder, and start the Next.js engine:
# Navigate into the frontend directory
cd frontend

# Install Node modules (First time only)
npm install

# Start the Next.js development server
npm run dev

The frontend user interface is now accessible at: http://localhost:3000
