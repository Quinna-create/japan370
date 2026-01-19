#!/usr/bin/env python3
"""
Extract kanji data from Heisig RTK Index ZIP files.
Parses TSV files and generates structured JSON output.
"""

import zipfile
import json
import csv
from pathlib import Path


def extract_kanji_data(zip_paths, output_path):
    """Extract kanji data from one or more ZIP files containing TSV data."""
    kanji_list = []
    seen_kanji = set()  # Track duplicates
    
    for zip_path in zip_paths:
        if not zip_path.exists():
            print(f"⚠️  Warning: {zip_path} not found, skipping...")
            continue
            
        print(f"📦 Processing {zip_path.name}...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for file_name in zip_ref.namelist():
                if file_name.endswith('.tsv') or file_name.endswith('.csv'):
                    print(f"  📄 Reading {file_name}")
                    
                    # Determine delimiter based on file extension
                    delimiter = '\t' if file_name.endswith('.tsv') else ','
                    
                    with zip_ref.open(file_name) as data_file:
                        content = data_file.read().decode('utf-8')
                        reader = csv.DictReader(content.splitlines(), delimiter=delimiter)
                        
                        for row in reader:
                            kanji_char = row.get('kanji', '').strip()
                            
                            # Skip empty entries or duplicates
                            if not kanji_char or kanji_char in seen_kanji:
                                continue
                            
                            seen_kanji.add(kanji_char)
                            
                            # Extract components/primitives (try multiple field names)
                            components = row.get('components', '') or row.get('primitives', '')
                            primitives = []
                            if components:
                                # Split on semicolon or comma and clean up
                                separators = [';', ',']
                                for sep in separators:
                                    if sep in components:
                                        primitives = [p.strip() for p in components.split(sep) if p.strip()]
                                        break
                                if not primitives:
                                    primitives = [components.strip()]
                            
                            # Parse heisig number (try multiple field names)
                            heisig_num = (row.get('index', '') or 
                                         row.get('id_6th_ed', '') or 
                                         row.get('id_5th_ed', '')).strip()
                            
                            # Get keyword (prefer 6th edition)
                            keyword = (row.get('keyword_6th_ed', '') or 
                                      row.get('keyword_5th_ed', '') or 
                                      row.get('keyword', '')).strip()
                            
                            kanji_entry = {
                                "id": len(kanji_list) + 1,
                                "kanji": kanji_char,
                                "keyword": keyword,
                                "heisig_number": heisig_num,
                                "primitives": primitives,
                                "user_story": "",
                                "last_reviewed": None,
                                "ease_factor": 2.5
                            }
                            kanji_list.append(kanji_entry)
    
    # Sort by heisig_number (numeric sort)
    def get_sort_key(entry):
        num_str = entry['heisig_number']
        # Handle both pure numbers and prefixed numbers (e.g., "RTK1-123")
        try:
            # Try to extract the numeric part
            if '-' in num_str:
                num_str = num_str.split('-')[-1]
            return int(num_str) if num_str.isdigit() else 99999
        except:
            return 99999
    
    kanji_list.sort(key=get_sort_key)
    
    # Write to JSON file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as json_file:
        json.dump(kanji_list, json_file, ensure_ascii=False, indent=2)
    
    return kanji_list


def main():
    """Main execution function."""
    # Look for all available ZIP files
    zip_files = [
        Path("heisig-rtk-index.zip"),
        Path("heisig-rtk-index-4.zip")
    ]
    
    output_file = Path("public/data/kanji.json")
    
    print("🚀 Starting kanji data extraction...\n")
    kanji_data = extract_kanji_data(zip_files, output_file)
    
    print(f"\n✅ Successfully extracted {len(kanji_data)} kanji characters")
    print(f"📁 Output saved to: {output_file}")
    
    # Show sample entries
    if kanji_data:
        print("\n📊 Sample entries:")
        for entry in kanji_data[:3]:
            print(f"  {entry['heisig_number']}: {entry['kanji']} - {entry['keyword']}")


if __name__ == "__main__":
    main()
