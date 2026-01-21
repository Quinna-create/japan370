#!/usr/bin/env python3
"""
Fetch stroke count data from KanjiVG or use cached data.
This script will try to use web resources or bundled data.
"""

import json
import urllib.request
import xml.etree.ElementTree as ET

def get_kanjivg_stroke_count(kanji_char):
    """
    Fetch stroke count from KanjiVG GitHub repository.
    KanjiVG SVG files contain path elements, one per stroke.
    """
    # KanjiVG uses unicode hex codes for filenames
    unicode_hex = f"{ord(kanji_char):05x}"
    url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{unicode_hex}.svg"
    
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            svg_data = response.read().decode('utf-8')
            
        # Parse SVG and count path elements (each path = one stroke)
        root = ET.fromstring(svg_data)
        # Count all path elements in the SVG
        # KanjiVG uses namespace
        namespaces = {'svg': 'http://www.w3.org/2000/svg'}
        paths = root.findall('.//svg:path', namespaces)
        
        # If no namespace, try without
        if not paths:
            paths = root.findall('.//path')
        
        return len(paths)
    except Exception as e:
        print(f"  Warning: Could not fetch KanjiVG data for {kanji_char} ({unicode_hex}): {e}")
        return None

# Create a comprehensive stroke count database
# This combines manual data with fetched data
STROKE_COUNT_DB = {
    # Basic numbers (1-10)
    '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
    
    # Common kanji from RTK Book 1
    '口': 3, '日': 4, '月': 4, '田': 5, '目': 5, '古': 5, '吾': 7, '冒': 9, '朋': 8,
    '明': 8, '唱': 11, '晶': 12, '品': 9, '呂': 7, '昌': 8, '早': 6, '旭': 6, '世': 5,
    '胃': 9, '旦': 5, '胆': 9, '亘': 6, '凹': 5, '凸': 5, '旧': 5, '自': 6, '白': 5,
    '百': 6, '中': 4, '千': 3, '舌': 6, '升': 4, '昇': 8, '丸': 3, '寸': 3, '専': 9,
    '博': 12, '占': 5, '上': 3, '下': 3, '卓': 8, '朝': 12, '貝': 7, '貞': 9, '員': 10,
    '見': 7, '児': 7, '元': 4, '頁': 9, '頑': 13, '凡': 3, '負': 9, '万': 3, '句': 5,
    '肌': 6, '旬': 6, '勺': 3, '的': 8, '首': 9, '乙': 1, '乱': 7, '直': 8, '具': 8,
    '真': 10, '工': 3, '左': 5, '右': 5, '有': 6, '賄': 13, '貢': 10, '項': 12,
    '刀': 2, '刃': 3, '切': 4, '召': 5, '昭': 9, '則': 9, '副': 11, '別': 7, '丁': 2,
    '町': 7, '可': 5, '河': 8, '何': 7, '荷': 10, '加': 5, '功': 5, '架': 9, '賀': 12,
}

def get_stroke_count(kanji_char, use_web=False):
    """Get stroke count for a kanji character."""
    # Check cache first
    if kanji_char in STROKE_COUNT_DB:
        return STROKE_COUNT_DB[kanji_char]
    
    # Try to fetch from web if enabled
    if use_web:
        count = get_kanjivg_stroke_count(kanji_char)
        if count:
            STROKE_COUNT_DB[kanji_char] = count
            return count
    
    # Default estimate based on complexity
    return 10

def save_stroke_count_db(filename='scripts/stroke_count_cache.json'):
    """Save the stroke count database to a file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(STROKE_COUNT_DB, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(STROKE_COUNT_DB)} stroke counts to {filename}")

if __name__ == '__main__':
    # Test
    test_chars = ['一', '二', '三', '日', '月', '木', '火', '水', '金', '土']
    print("Testing stroke counts:")
    for char in test_chars:
        print(f"  {char}: {get_stroke_count(char)} strokes")
