# 🎮 Game Finder

Game Finder is a beautiful, AI-powered Streamlit web application that acts as a personalized video game matchmaker. Enter your preferred genre, age rating, and difficulty level, and Game Finder leverages Gemini AI to recommend exactly 8 diverse, hand-picked games that fit your exact criteria.

## ✨ Features

- **AI-Powered Recommendations**: Uses Google's Gemini API (`gemini-3.5-flash-lite`) to understand nuances in game genres and difficulties.
- **Dynamic Image Sourcing**: Automatically pulls high-quality official screenshots from the **Steam API**, seamlessly falling back to heavily-validated web search images for console exclusives.
- **Glassmorphism UI**: Features a sleek, modern, fully responsive UI with custom CSS, animated gradient backgrounds, and hover effects.
- **GOTY Section**: Explore the historic Game of the Year winners from The Game Awards using the built-in inline toggle.

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Game-Finder
   ```

2. **Install dependencies**:
   Make sure you have Python installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up API Keys**:
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run the application**:
   ```bash
   streamlit run Game_Finder.py
   ```

## 🛠️ Built With

- [Streamlit](https://streamlit.io/) - The web framework used
- [LangChain](https://python.langchain.com/) - LLM orchestration
- [Google Gemini API](https://ai.google.dev/) - AI reasoning and matching
- Steam API - High-quality image fetching
