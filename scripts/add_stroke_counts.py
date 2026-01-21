#!/usr/bin/env python3
"""
Add stroke counts to existing kanji.json file.
This script reads the existing file and adds strokeCount field.
"""

import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET
import time

STROKE_COUNT_CACHE_FILE = Path("scripts/stroke_count_cache.json")

def load_stroke_count_cache():
    """Load cached stroke counts from file."""
    if STROKE_COUNT_CACHE_FILE.exists():
        try:
            with open(STROKE_COUNT_CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_stroke_count_cache(cache):
    """Save stroke count cache to file."""
    STROKE_COUNT_CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STROKE_COUNT_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def get_kanjivg_stroke_count(kanji_char, cache, retry_count=2):
    """
    Fetch stroke count from KanjiVG GitHub repository.
    Returns the number of strokes, or None if unavailable.
    """
    if kanji_char in cache:
        return cache[kanji_char]
    
    unicode_hex = f"{ord(kanji_char):05x}"
    url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{unicode_hex}.svg"
    
    for attempt in range(retry_count):
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
        except Exception as e:
            if attempt < retry_count - 1:
                time.sleep(0.5)
                continue
            return None
    
    return None

def main():
    """Main execution function."""
    kanji_file = Path("public/data/kanji.json")
    
    if not kanji_file.exists():
        print("❌ Error: kanji.json not found")
        return
    
    print("📖 Loading existing kanji data...")
    with open(kanji_file, 'r', encoding='utf-8') as f:
        kanji_data = json.load(f)
    
    print(f"✓ Loaded {len(kanji_data)} kanji")
    
    # Load cache
    stroke_count_cache = load_stroke_count_cache()
    print(f"📦 Loaded {len(stroke_count_cache)} cached stroke counts")
    
    # Update kanji with stroke counts
    updated_count = 0
    failed_count = 0
    
    for i, entry in enumerate(kanji_data):
        # Skip if already has strokeCount
        if 'strokeCount' in entry and entry['strokeCount'] > 0:
            continue
        
        kanji_char = entry['kanji']
        stroke_count = get_kanjivg_stroke_count(kanji_char, stroke_count_cache)
        
        if stroke_count is not None:
            entry['strokeCount'] = stroke_count
            updated_count += 1
            
            # Show progress
            if (i + 1) % 50 == 0:
                print(f"  ✓ Processed {i + 1}/{len(kanji_data)} kanji... (updated: {updated_count})")
                # Save cache periodically
                save_stroke_count_cache(stroke_count_cache)
        else:
            # Use default for unavailable data
            entry['strokeCount'] = 10
            failed_count += 1
            print(f"  ⚠️  No data for {kanji_char} (#{entry.get('heisig_number', '?')})")
        
        # Rate limiting
        if kanji_char not in stroke_count_cache:
            time.sleep(0.15)
    
    # Save updated data
    print(f"\n💾 Saving updated kanji data...")
    with open(kanji_file, 'w', encoding='utf-8') as f:
        json.dump(kanji_data, f, ensure_ascii=False, indent=2)
    
    # Save final cache
    save_stroke_count_cache(stroke_count_cache)
    
    print(f"\n✅ Complete!")
    print(f"   Updated: {updated_count}")
    print(f"   Failed (using default): {failed_count}")
    print(f"   Cache size: {len(stroke_count_cache)}")

if __name__ == "__main__":
    main()
