import fitz # PyMuPDF

def extract_text_from_pdf(pdf_path):
    """
    Extracts all text from a PDF file, concatenating it into a single string.
    """
    full_raw_text = ""
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            full_raw_text += page.get_text("text") + "\n\n" # Concatenate text from all pages
        doc.close()
    except Exception as e:
        print(f"    Error extracting text from {pdf_path}: {e}")
        return None
    return full_raw_text
