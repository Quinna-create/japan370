#!/usr/bin/env python3
"""
Add stroke counts to first 800 kanji (enough for RTK Book 1 lessons 1-10).
"""

import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET
import time

STROKE_COUNT_CACHE_FILE = Path("scripts/stroke_count_cache.json")

def load_cache():
    if STROKE_COUNT_CACHE_FILE.exists():
        try:
            with open(STROKE_COUNT_CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    STROKE_COUNT_CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STROKE_COUNT_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def get_stroke_count(kanji_char, cache):
    if kanji_char in cache:
        return cache[kanji_char]
    
    unicode_hex = f"{ord(kanji_char):05x}"
    url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{unicode_hex}.svg"
    
    for attempt in range(2):
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                svg_data = response.read().decode('utf-8')
            
            root = ET.fromstring(svg_data)
            paths = root.findall('.//{http://www.w3.org/2000/svg}path')
            if not paths:
                paths = root.findall('.//path')
            
            count = len(paths) if paths else None
            if count is not None:
                cache[kanji_char] = count
            return count
        except:
            if attempt < 1:
                time.sleep(0.5)
            continue
    return None

# Load data
kanji_file = Path("public/data/kanji.json")
with open(kanji_file, 'r', encoding='utf-8') as f:
    kanji_data = json.load(f)

cache = load_cache()
print(f"Processing first 800 kanji (cached: {len(cache)})...")

for i in range(min(800, len(kanji_data))):
    entry = kanji_data[i]
    if 'strokeCount' not in entry or entry['strokeCount'] == 0:
        kanji_char = entry['kanji']
        count = get_stroke_count(kanji_char, cache)
        entry['strokeCount'] = count if count else 10
        
        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/800 done...")
            save_cache(cache)
        
        if kanji_char not in cache:
            time.sleep(0.15)

# Save
with open(kanji_file, 'w', encoding='utf-8') as f:
    json.dump(kanji_data, f, ensure_ascii=False, indent=2)

save_cache(cache)
print(f"✅ Done! Cache: {len(cache)} entries")
