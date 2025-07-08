# Uni-Docs Core: Lecture Notes Processor / Amlify your studying routine

Uni-Docs Core is the backend processing and frontend display engine for transforming your lecture PDFs into an interactive, searchable, and quiz-enhanced learning platform. This repository contains the essential code for processing content and displaying it in a web-based interface, free of personal data, API keys (which you provide locally), and specific UI/GUI wrappers.

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&slug=stoff&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff)](https://coff.ee/stoff)

## Purpose

This project demonstrates how to:
*   Extract text from PDF documents.
*   Leverage large language models for content summarization and quiz generation.
*   Build a local web-based interface for navigating and interacting with processed educational content.

## Features

*   **PDF Text Extraction:** Extracts all text from PDF files.
*   **AI-Powered Content Generation:** Uses the Google Gemini API to:
    *   Generate detailed, comprehensive explanations of lecture content in Markdown format.
    *   Create multiple-choice questions with correct answers and explanations for each processed lecture page.
*   **Web-Based Frontend:** A clean, Rust-documentation-inspired interface for viewing processed content, with search and interactive quizzes.
*   **Incremental Processing:** Processes only new or changed PDF files.
*   **Reprocessing Option:** Force a full re-processing of all files.

## A Single Screenshot giving you a rough idea of what processed web page looks like after processing your PDFs

Long presentations will result in longer web pages covering all topics present in the file! :)

![Screenshot_20250707_041704](https://github.com/user-attachments/assets/97c232e8-8349-44b0-ad82-c43c30d21f45)

## Setup

### Prerequisites

*   **Python 3.8+:** Ensure Python is installed on your system.
*   **pip:** Python's package installer.

### Installation

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/NoSTDs/Websitify-Documents.git uni-docs-core
    cd uni-docs-core
    ```

2.  **Create a Python Virtual Environment:**
    This isolates project dependencies from your system's Python installation.
    ```bash
    python3 -m venv venv
    ```

3.  **Install Python Dependencies:**
    Activate the virtual environment and install the required libraries.
    ```bash
    source venv/bin/activate
    pip install PyMuPDF google-generativeai marked
    ```

### Google Gemini API Key Setup

Uni-Docs Core uses the Google Gemini API.

1.  **Get an API Key:**
    Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a new API key.

2.  **Set as Environment Variable (Crucial for Security):**
    **NEVER hardcode your API key directly into the script.** Instead, set it as an environment variable in your terminal session *before* running the processing script.
    ```bash
    export GOOGLE_API_KEY='YOUR_API_KEY_HERE'
    ```
    Replace `YOUR_API_KEY_HERE` with the actual API key you obtained.
    *Note: This variable is only set for the current terminal session. If you open a new terminal, you'll need to run this command again.*

## Usage

### 1. Organize Your Lecture PDFs

Create a folder named `input_pdfs` in the root of your `uni-docs-core` directory. Inside `input_pdfs`, create subfolders for each university module. Place your PDF lecture files within these module subfolders.

Example structure:

```
uni-docs-core/
├── input_pdfs/
│   ├── Computer_Networks/
│   │   ├── Intro_to_Networking.pdf
│   │   └── TCP_IP_Stack.pdf
│   └── Discrete_Mathematics/
│       ├── Logic_Fundamentals.pdf
│       └── Set_Theory.pdf
├── venv/
├── main_processor.py
├── gemini_api_handler.py
├── pdf_extractor.py
├── index.html
├── script.js
├── style.css
├── marked.min.js
├── data.json (generated)
└── README.md (this file)
```

### 2. Run the Processing Script

This script extracts text, generates summaries, and creates quizzes.

1.  **Navigate to the project root:**
    ```bash
    cd uni-docs-core/
    ```

2.  **Run the processor:**
    ```bash
    GOOGLE_API_KEY='YOUR_API_KEY_HERE' ./main_processor.py
    ```
    Replace `YOUR_API_KEY_HERE` with your actual API key.

    *   **Incremental Processing:** By default, the script will only process new PDF files or those not yet in `data.json`.
    *   **Force Reprocessing:** To re-process all files (e.g., after changing the AI prompt or if you want to refresh all content), use the `--reprocess` or `-r` flag:
        ```bash
        GOOGLE_API_KEY='YOUR_API_KEY_HERE' ./main_processor.py --reprocess
        ```

    The script will print its progress as it processes each file and updates `data.json`.

### 3. Serve the Frontend

Your browser has security restrictions that prevent local JavaScript from loading local files directly. You need a simple web server to view Uni-Docs. **(Not really, I think, possible aislop, worked for me by opening index.html just fine)**

1.  **Navigate to the project root:**
    ```bash
    cd uni-docs-core/
    ```

2.  **Start a Python web server:**
    ```bash
    python3 -m http.server 8000
    ```
    This will start a server on port 8000. Keep this terminal window open as long as you want the server to run.

3.  **Open in Browser:**
    Open your web browser and go to:
    `http://localhost:8000/`

You should now see your Uni-Docs interface with your processed lecture content, AI summaries, and interactive quizzes!

## Troubleshooting

*   **Empty Page / No Data:** Ensure `data.json` is not empty. If it is, check your `input_pdfs` structure and re-run `main_processor.py`. Also, ensure your web server is running and you're accessing via `http://localhost:8000/`.
*   **API Key Errors:** Double-check that your `GOOGLE_API_KEY` environment variable is correctly set in the terminal session where you run `main_processor.py`. If you generated a new key, ensure you're using the latest one.
*   **`SyntaxError` or `Permission denied`:** Ensure `main_processor.py` has execute permissions (`chmod +x main_processor.py`) and that you are running it with `./main_processor.py` (after `cd`ing into the project directory) and not `python main_processor.py`.

---
