import pandas as pd
import json
import os
from datetime import datetime

excel_path = 'Globmed.xlsx'
output_json = 'data.json'

if not os.path.exists(excel_path):
    print("Excel file not found!")
    exit(1)

# Get current modification date in format YYYY-MM-DD (or Arabic format)
# We will format it nicely in JS, but let's store the ISO/Timestamp or formatted string
file_mod_time = os.path.getmtime(excel_path)
formatted_date = datetime.fromtimestamp(file_mod_time).strftime('%Y-%m-%d %H:%M')

xls = pd.ExcelFile(excel_path)
records = []

known_main_cats = [
    "الأطباء", "المستشفيات", "المراكز الطبية", "المستشفيات والمراكز الطبية", 
    "الصيدليات", "المختبرات الطبية", "المختبرات", "مراكز الأشعة", 
    "مراكز العلاج الطبيعي", "مراكز السمعيات"
]

for sheet_name in xls.sheet_names:
    city_name = sheet_name.strip()
    df_raw = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
    
    current_main_cat = "عام"
    current_sub_cat = "-"
    
    for idx, row in df_raw.iterrows():
        vals = [str(v).strip() for v in row.values if pd.notna(v) and str(v).strip() != ""]
        if not vals:
            continue
            
        first_val = str(row.values[0]).strip() if pd.notna(row.values[0]) else ""
        
        if any(h in vals for h in ["العنوان", "الهاتف", "الجوال", "اسم المزود", "الاسم"]):
            if first_val not in ["الاسم", "اسم المزود", "اسم الطبيب", "العنوان", "nan"]:
                current_sub_cat = first_val
            continue
            
        if len(vals) == 1:
            val = vals[0]
            if val in known_main_cats or any(cat in val for cat in ["أطباء", "صيدليات", "مستشفيات", "مختبرات"]):
                current_main_cat = val
                current_sub_cat = "-"
            else:
                current_sub_cat = val
            continue
            
        name = first_val
        address = str(row.values[1]).strip() if len(row.values) > 1 and pd.notna(row.values[1]) else "-"
        phone = str(row.values[2]).strip() if len(row.values) > 2 and pd.notna(row.values[2]) else "-"
        mobile = str(row.values[3]).strip() if len(row.values) > 3 and pd.notna(row.values[3]) else "-"
        
        phone = phone.replace('.0', '')
        mobile = mobile.replace('.0', '')
        
        if name and name not in ["الاسم", "اسم المزود", "العنوان"]:
            records.append({
                "name": name,
                "city": city_name,
                "address": address,
                "category": current_main_cat,
                "subCategory": current_sub_cat if current_sub_cat else "-",
                "phone": phone if phone != "nan" else "-",
                "mobile": mobile if mobile != "nan" else "-"
            })

# Save metadata along with records using a wrapper object
final_output = {
    "lastUpdated": formatted_date,
    "data": records
}

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(final_output, f, ensure_ascii=False, indent=2)

print(f"Successfully processed {len(records)} records with timestamp {formatted_date}")
