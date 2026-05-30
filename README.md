🧠 AI-Stylish — AI Powered Wardrobe & Outfit Recommendation System

AI-Stylish is an AI-powered fashion assistant that analyzes clothing images, extracts primary & secondary colors, generates color palettes, and recommends matching outfits using color theory + visual similarity + embeddings.

It combines a modern AI stack across Next.js (frontend) and Django (backend) to deliver a seamless smart styling experience.

✨ Features
🎨 Color Intelligence

Extract primary & secondary colors using KMeans + ColorThief

Show color palette previews

Auto color naming (Meodai color-name dataset)

Color harmony–based outfit recommendations

🤖 Smart Recommendations

Suggest outfits based on complementary & analogous color rules

Detect style similarity using embeddings

Recommend similar products from wardrobe or store catalog

📸 Wardrobe Management

Upload your clothes

Auto-classify colors

View saved items

Use wardrobe items to build outfit recommendations

⚙️ Tech Stack
Layer	Technology
Frontend	Next.js, TailwindCSS, TypeScript
Backend	Django / Python
AI / ML	ColorThief, KMeans (scikit-learn), Embeddings Models
Storage	Local media folder (can upgrade to AWS S3 / Cloudinary)
Tools	Pillow, NumPy, Meodai Colors JSON🚀 How to Run the Project Locally
1️⃣ Clone the repository
git clone https://github.com/SMOHAMMADIMDAD/Ai-Stylish
cd Ai-Stylish

2️⃣ Run the Backend (Django)
cd zyvia_backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# or
source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver


The backend runs at:

http://127.0.0.1:8000

3️⃣ Run the Frontend (Next.js)
cd zyvia-frontend

npm install
npm run dev


Frontend runs at:

http://localhost:3000

🔗 Connecting Frontend to Backend

Inside your frontend .env.local file:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000


Use it in Next.js like:

const api = process.env.NEXT_PUBLIC_API_URL;

📈 Future Enhancements

👕 Virtual outfit try-on (AI garment overlay)

🧥 Full-body embeddings (CLIP / ViT) for better matching

☁ Deploy image storage on Cloudinary or AWS S3

🔥 Outfit generation using stable diffusion / generative model

📱 Mobile app integration (Flutter or React Native)

🛍 E-commerce product recommendations

🌟 Author

S Mohammad Imdad
AI & Full-Stack Developer
Passionate about AI fashion technology & intelligent systems.
# Ai-Stylish
AI Stylist is an AI-powered fashion assistant that analyzes wardrobe images, extracts primary &amp; secondary colors, generates color palettes, and recommends matching outfits using color harmony rules and semantic similarity. Built using Python, ColorThief, KMeans, and modern embedding models.
