import json
import requests
from langchain_google_genai import GoogleGenerativeAI
from dotenv import load_dotenv
import streamlit as st
import urllib.parse
from langchain_core.prompts import load_prompt

load_dotenv()


st.set_page_config(page_title="Game Matcher", page_icon="🎮", layout="wide")

# Helper function to get image from Wikipedia
@st.cache_data
def get_image_url(name):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(name)}&prop=pageimages&format=json&pithumbsize=500"
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            if 'thumbnail' in page_info:
                return page_info['thumbnail']['source']
    except Exception:
        pass
    # Fallback avatar
    return f"https://ui-avatars.com/api/?name={urllib.parse.quote(name)}&color=fff&size=500&font-size=0.33"

# Custom CSS for Premium Glassmorphism & Typography
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* Hide standard Streamlit header/footer for a cleaner app feel */
    header {visibility: hidden;}
    footer {visibility: hidden;}

    /* Animated Dynamic Fractal-like Gradient Background */
    .stApp {
        background: linear-gradient(-45deg, #0f0c29, #302b63, #6a1939, #a03c30, #24243e);
        background-size: 400% 400%;
        animation: gradientBG 24s ease infinite;
        background-attachment: fixed;
    }
    
    @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Vertical Centering & Zoom-in effect */
    /* Streamlit's main app container */
    .appview-container > section:first-child {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100vh;
    }

    /* Remove Streamlit's aggressive default padding */
    .css-18e3th9 {
        padding-top: 0rem !important;
    }

    /* Glassmorphic Main Container */
    .block-container {
        max-width: 1000px !important;
        background: rgba(12, 8, 20, 0.25) !important;
        backdrop-filter: blur(40px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(40px) saturate(160%) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        border-radius: 36px !important;
        padding: 55px 65px !important;
        margin: auto !important;
    }
    
    @media (max-width: 768px) {
        .block-container {
            padding: 35px 25px !important;
            border-radius: 26px !important;
        }
    }

    /* Hero Heading Section */
    .hero-container {
        text-align: center;
        margin-bottom: 50px;
    }
    
    .hero-title {
        font-weight: 800;
        font-size: 3.6rem !important;
        letter-spacing: -1.2px;
        margin-bottom: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #e0d0ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0px 4px 30px rgba(255, 255, 255, 0.1);
    }

    .hero-subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 300;
        letter-spacing: 0.4px;
    }

    /* Form Fields Styling */
    .stSelectbox label p {
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.5) !important;
        margin-bottom: 10px;
        letter-spacing: 1px;
    }

    /* Dropdown Input Glass */
    .stSelectbox > div[data-baseweb="select"] {
        background: rgba(0, 0, 0, 0.2) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 16px;
        transition: all 0.3s ease;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
        padding: 4px;
    }
    
    .stSelectbox > div[data-baseweb="select"]:hover {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
    }

    .stSelectbox > div[data-baseweb="select"] * {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 1.1rem;
        font-weight: 400;
    }

    /* Premium Handcrafted Glass Button */
    .stButton>button {
        background: rgba(255, 255, 255, 0.05) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: rgba(255, 255, 255, 0.95) !important;
        padding: 18px 32px;
        font-size: 1.3rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        width: 100%;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        margin-top: 40px;
    }
    
    .stButton>button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-2px);
        box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    
    .stButton>button:active {
        transform: translateY(1px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    /* Section Headings */
    .section-title {
        font-weight: 400;
        font-size: 1.6rem;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 60px;
        margin-bottom: 40px;
    }

    /* Premium Handcrafted Profile Match Card */
    .star-card {
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        border-radius: 36px;
        padding: 50px 45px;
        margin-bottom: 45px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
    }
    
    .star-card:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.02);
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    /* Elegant Image Treatment */
    .star-image {
        width: 160px;
        height: 160px;
        object-fit: cover;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        margin-bottom: 25px;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 4px;
        background: rgba(255, 255, 255, 0.02);
    }
    
    .star-card:hover .star-image {
        transform: scale(1.05);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }
    
    .star-name {
        color: rgba(255, 255, 255, 0.95);
        font-size: 2.3rem;
        font-weight: 600;
        letter-spacing: -0.5px;
        margin-bottom: 14px;
    }
    
    .star-reason {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.65);
        margin-bottom: 30px;
        line-height: 1.7;
        font-weight: 300;
        max-width: 85%;
    }
    
    .star-attributes-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-bottom: 35px;
    }
    
    /* Subdued Glass Chips */
    .star-attribute {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 8px 18px;
        border-radius: 999px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 400;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        text-align: center;
    }
    
    .star-card:hover .star-attribute {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    .search-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.85) !important;
        text-decoration: none;
        padding: 12px 30px;
        border-radius: 999px;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(10px);
    }
    
    .search-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff !important;
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Hover Glassy Box for Web Images */
    .hover-images-box {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(12, 8, 20, 0.85);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border-radius: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 10;
        pointer-events: none;
    }
    
    .star-card:hover .hover-images-box {
        opacity: 1;
        pointer-events: auto;
    }

    .hover-images-container {
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;
        margin-top: 10px;
    }

    .hover-img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    
    .hover-images-title {
        color: white;
        font-weight: 600;
        font-size: 1.4rem;
        margin-bottom: 15px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
</style>
""", unsafe_allow_html=True)

# Hero Section
st.markdown("""
<div class="hero-container">
    <div class="hero-title">Game Finder</div>
    <div class="hero-subtitle">🎮 Find Your Perfect Game Match</div>
</div>
""", unsafe_allow_html=True)

# Form Section
with st.container():
    col1, col2, col3 = st.columns(3)
    with col1:
        genre = st.selectbox("Select Genre", ['Action', 'RPG', 'Shooter', 'Strategy', 'Puzzle', 'Simulation', 'Sports', 'Racing', 'Platformer', 'Horror', 'Any'])
    with col2:
        age = st.selectbox('Select Age Rating', ['E (Everyone)', 'E10+ (Everyone 10+)', 'T (Teen)', 'M (Mature)', 'AO (Adults Only)', 'Any'])
    with col3:
        difficulty = st.selectbox('Select Difficulty', ['Casual', 'Normal', 'Hard', 'Punishing', 'Any'])

model = GoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    max_retries=5,temperature=0.4
)
# Use a relative path so it works in deployment environments
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
prompt_path = os.path.join(current_dir, 'prompt.json')
template = load_prompt(prompt_path)

import time

@st.cache_data(show_spinner=False, ttl=3600)
def get_web_images(name):
    # Try Steam API first (fast and perfectly relevant for most games)
    try:
        search_url = f'https://store.steampowered.com/api/storesearch/?term={urllib.parse.quote(name)}&l=english&cc=US'
        res = requests.get(search_url, timeout=5).json()
        if res.get('items'):
            appid = res['items'][0]['id']
            details_url = f'https://store.steampowered.com/api/appdetails?appids={appid}'
            details = requests.get(details_url, timeout=5).json()
            if details[str(appid)]['success']:
                data = details[str(appid)]['data']
                images = []
                if 'screenshots' in data:
                    for s in data['screenshots'][:2]:
                        images.append(s['path_full'])
                if images:
                    return images
    except Exception as e:
        print(f"Steam API failed for {name}: {e}")

    # Fallback to Bing Images
    queries = [f'"{name}" video game', f'"{name}" gameplay']
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Cookie': 'SRCHHPGUSR=ADLT=OFF'
    }
    
    import re
    # Extract significant words from game name for strict title matching
    filler = {"the", "of", "and", "in", "to", "a", "an", "for", "with", "edition", "game"}
    name_parts = [p.lower() for p in re.split(r'\W+', name) if p.lower() not in filler and len(p) > 2]
    if not name_parts:
        name_parts = [name.lower()]
        
    for query in queries:
        try:
            url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
            response = requests.get(url, headers=headers, timeout=5)
            
            matches = re.findall(r'murl&quot;:&quot;(.*?)&quot;.*?t&quot;:&quot;(.*?)&quot;', response.text, re.IGNORECASE)
            if not matches:
                matches = re.findall(r'"murl":"(.*?)".*?"t":"(.*?)"', response.text, re.IGNORECASE)
                
            valid_images = []
            for img_url, title in matches:
                title_lower = title.lower()
                
                # STRICT check: ALL significant name parts must be in the title
                if not all(part in title_lower for part in name_parts):
                    continue
                    
                try:
                    head_res = requests.get(img_url, headers={'User-Agent': headers['User-Agent']}, stream=True, timeout=3)
                    if head_res.status_code in [200, 403]: # Allow 403 as some CDNs block headless bot pings but render in browser
                        valid_images.append(img_url)
                        if len(valid_images) == 2:
                            break
                except Exception:
                    continue
            
            if valid_images:
                return valid_images
                
        except Exception:
            continue
            
    return []

@st.cache_data(show_spinner=False, ttl=3600)
def get_match_results(genre, age, difficulty):
    chain = template | model 
    for attempt in range(5):
        try:
            return chain.invoke({
                'genre': genre, 
                'age': age, 
                'difficulty': difficulty
            })
        except Exception as e:
            if "503" in str(e) and attempt < 4:
                time.sleep(2)
                continue
            raise

if st.button('✨ Find My Match ✨'):
    with st.spinner("Analyzing preferences and searching for the perfect games..."):
        try:
            results = get_match_results(genre, age, difficulty)
            
            clean_results = results.replace("```json", "").replace("```", "").strip()
            
            try:
                games = json.loads(clean_results)
                
                if len(games) > 8:
                    games = games[:8]
                
                st.markdown("<div class='section-title'>Top Game Matches</div>", unsafe_allow_html=True)
                
                for game in games:
                    name = game.get("name", "Unknown Game")
                    reason = game.get("match_reason", "")
                    attributes = game.get("attributes", [])
                    
                    search_query = urllib.parse.quote(name + " game")
                    search_url = f"https://www.google.com/search?tbm=isch&q={search_query}"
                    image_url = get_image_url(name)
                    
                    web_images = get_web_images(name)
                    
                    attr_html = "".join([f"<span class='star-attribute'>{attr}</span>" for attr in attributes])
                    
                    web_images_html = ""
                    if web_images:
                        img_tags = "".join([
                            f"<img src='{img}' style='width: 100%; height: 180px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.3s ease;' onmouseover='this.style.transform=\"scale(1.05)\"' onmouseout='this.style.transform=\"scale(1)\"' />" 
                            for img in web_images
                        ])
                        web_images_html = (
                            f"<div style='width: 100%; margin-top: 15px; margin-bottom: 25px;'>"
                            f"<div style='font-size: 1.1rem; color: rgba(255,255,255,0.9); font-weight: 500; margin-bottom: 12px; letter-spacing: 0.5px;'>Web Images</div>"
                            f"<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;'>"
                            f"{img_tags}"
                            f"</div></div>"
                        )
                    else:
                        web_images_html = (
                            f"<div style='width: 100%; margin-top: 15px; margin-bottom: 25px;'>"
                            f"<div style='font-size: 1.1rem; color: rgba(255,255,255,0.9); font-weight: 500; margin-bottom: 12px; letter-spacing: 0.5px;'>Web Images</div>"
                            f"<div style='color: rgba(255,255,255,0.5); font-style: italic; font-size: 0.95rem; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);'>No verified images found</div>"
                            f"</div>"
                        )
                    
                    final_html = (
                        f"<div class='star-card'>"
                        f"<img src='{image_url}' class='star-image' alt='{name}'>"
                        f"<div class='star-name'>{name}</div>"
                        f"<div class='star-reason'>{reason}</div>"
                        f"<div class='star-attributes-container'>{attr_html}</div>"
                        f"{web_images_html}"
                        f"<a href='{search_url}' target='_blank' class='search-btn'>🔍 View More Images</a>"
                        f"</div>"
                    )
                    st.markdown(final_html, unsafe_allow_html=True)                    
            except json.JSONDecodeError:
                st.error("Could not parse the results. Please try again.")
                st.code(results)
        except Exception as e:
            error_msg = str(e).lower()
            if "429" in error_msg or "exhausted" in error_msg or "quota" in error_msg:
                st.error("⚠️ **API Quota Exhausted!** You have hit the rate limit for the Gemini API. Please wait a minute before trying again, or check your API billing limits in Google AI Studio.")
            elif "503" in error_msg or "unavailable" in error_msg:
                st.error("⚠️ **High Demand!** The Gemini API is currently experiencing high demand. We retried automatically but it's still overloaded. Please try again in a few moments.")
            else:
                st.error(f"An error occurred: {e}")

# GOTY Section
st.markdown("<hr style='border:1px solid rgba(255,255,255,0.1); margin: 60px 0;'>", unsafe_allow_html=True)

if 'show_goty' not in st.session_state:
    st.session_state.show_goty = False

col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    if st.button("🏆 Toggle Game of the Year Winners", use_container_width=True):
        st.session_state.show_goty = not st.session_state.show_goty

if st.session_state.show_goty:
    st.markdown("<div class='section-title'>Game of the Year Winners (The Game Awards)</div>", unsafe_allow_html=True)
    
    goty_html = """
    <div style='display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-bottom: 20px;'>
    """
    goty_list = [
        ("2014", "Dragon Age: Inquisition"),
        ("2015", "The Witcher 3: Wild Hunt"),
        ("2016", "Overwatch"),
        ("2017", "The Legend of Zelda: Breath of the Wild"),
        ("2018", "God of War"),
        ("2019", "Sekiro: Shadows Die Twice"),
        ("2020", "The Last of Us Part II"),
        ("2021", "It Takes Two"),
        ("2022", "Elden Ring"),
        ("2023", "Baldur's Gate 3"),
        ("2024", "Astro Bot")
    ]
    
    for year, title in goty_list:
        goty_html += f"<div class='star-attribute' style='font-size: 1.1rem; padding: 12px 24px; min-width: 250px;'><strong>{year}</strong><br>{title}</div>"
    
    goty_html += "</div>"
    st.markdown(goty_html, unsafe_allow_html=True)
