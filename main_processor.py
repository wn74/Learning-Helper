#!/home/deck/Documents/programming/ai/uni-docs-project/venv/bin/python
import os
import json
import sys # Import sys to read command-line arguments
from gemini_api_handler import initialize_gemini_model, generate_coherent_text, generate_test
from pdf_extractor import extract_text_from_pdf

# --- Configuration ---
INPUT_DIR = 'input_pdfs'
OUTPUT_FILE = 'data.json'

def process_all_modules():
    """
    Orchestrates the processing of all PDFs, generating coherent summaries and tests per PDF,
    and creates a JSON file for the frontend.
    Updates the JSON file after each PDF is processed.
    Accepts --reprocess or -r argument to force full reprocessing.
    """
    # Initialize the Gemini model once at the start
    initialize_gemini_model()

    if not os.path.exists(INPUT_DIR):
        print(f"Error: Input directory '{INPUT_DIR}' not found.")
        return

    # Check for reprocess flag
    reprocess_flag = False
    if '--reprocess' in sys.argv or '-r' in sys.argv:
        reprocess_flag = True
        print("Reprocess flag detected. All files will be reprocessed.")

    # Load existing data if available, to allow for incremental updates
    course_data = {"modules": []}
    if os.path.exists(OUTPUT_FILE) and not reprocess_flag:
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                course_data = json.load(f)
            print(f"Loaded existing data from {OUTPUT_FILE}")
        except json.JSONDecodeError:
            print(f"Warning: Could not decode existing {OUTPUT_FILE}. Starting with empty data.")
            course_data = {"modules": []}

    # Keep track of processed files to avoid re-processing
    processed_files = set()
    if not reprocess_flag:
        for module_entry in course_data["modules"]:
            for page_entry in module_entry.get("pages", []):
                processed_files.add(page_entry["id"])

    # If reprocess_flag is true, we start with empty course_data and processed_files
    if reprocess_flag:
        course_data = {"modules": []}
        processed_files = set()

    for module_name in sorted(os.listdir(INPUT_DIR)):
        module_path = os.path.join(INPUT_DIR, module_name)
        if os.path.isdir(module_path):
            print(f"Processing module: {module_name}...")
            
            # Find or create module entry in course_data
            module_data = next((m for m in course_data["modules"] if m["name"] == module_name), None)
            if not module_data:
                module_data = {"name": module_name, "pages": []}
                course_data["modules"].append(module_data)

            for filename in sorted(os.listdir(module_path)):
                if filename.lower().endswith('.pdf'):
                    pdf_path = os.path.join(module_path, filename)
                    page_id = f"{module_name}_{os.path.splitext(filename)[0]}"

                    if page_id in processed_files:
                        print(f"  - Skipping {filename} (already processed).")
                        continue

                    try:
                        print(f"  - Reading {filename}...")
                        full_raw_text = extract_text_from_pdf(pdf_path)
                        if full_raw_text is None:
                            print(f"    Skipping {filename} due to extraction error.")
                            continue

                        # Generate the "Coherent Summary" for the entire PDF
                        coherent_text = generate_coherent_text(full_raw_text)

                        # Generate tests for the entire PDF content
                        tests = generate_test(coherent_text)

                        page_title = os.path.splitext(filename)[0].replace('_', ' ')

                        module_data["pages"].append({
                            "id": page_id,
                            "title": page_title,
                            "content": coherent_text,
                            "tests": tests
                        })
                        
                        # --- Write to JSON after each file ---
                        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                            json.dump(course_data, f, indent=4)
                        print(f"  - Data for {filename} written to {OUTPUT_FILE}")
                        processed_files.add(page_id)

                    except Exception as e:
                        print(f"    Error processing {filename}: {e}")
            
    print(f"\nProcessing complete. Final data written to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_all_modules()
