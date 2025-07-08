import os
import json
import re
import google.generativeai as genai

# --- Gemini API Configuration ---
API_KEY = os.getenv('GOOGLE_API_KEY')
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("Warning: GOOGLE_API_KEY environment variable not set. Gemini API calls will likely fail.")

model = None # Will be set after checking available models

def initialize_gemini_model():
    """
    Initializes the Gemini model, trying gemini-pro, then gemini-1.5-pro-latest,
    or the first available model that supports generateContent.
    """
    global model
    print("\n--- Available Gemini Models ---")
    found_model = False
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name} (Supports generateContent)")
            available_models.append(m.name)
            found_model = True
    if not found_model:
        print("No models found that support generateContent. Check your API key and region.")
    print("-------------------------------\n")

    selected_model_name = None
    if 'models/gemini-2.5-pro' in available_models:
        selected_model_name = 'gemini-2.5-pro'
    elif 'models/gemini-1.5-pro-latest' in available_models:
        selected_model_name = 'gemini-1.5-pro-latest'
    elif 'models/gemini-pro' in available_models:
        selected_model_name = 'gemini-pro'
    else:
        print("Warning: Neither gemini-pro nor gemini-1.5-pro-latest found. Attempting to use the first available model.")
        if available_models: # Check if there are any models at all
            selected_model_name = available_models[0] # Pick the first one
        else:
            print("Error: No suitable Gemini model found. Exiting.")
            exit(1) # Exit if no models are available at all

    if selected_model_name:
        model = genai.GenerativeModel(selected_model_name)
        print(f"Using model: {model.model_name}")
    else: # This case should ideally be caught by the exit(1) above, but as a fallback
        print("Error: No suitable Gemini model found after selection attempts. Exiting.")
        exit(1)

def generate_coherent_text(raw_text):
    """
    Uses the Gemini API to generate a coherent summary from the raw slide text.
    """
    if not raw_text.strip():
        return "(No text on page)"

    prompt = f"Provide a detailed and comprehensive explanation of the following lecture text, as if it were a section in a textbook or documentation. Elaborate on key concepts, definitions, and relationships. Aim for a thorough overview that covers all important aspects of the text. Format your response using Markdown, including headings, bullet points, and code blocks where appropriate.\n\n{raw_text}"
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"  - Gemini API error during summarization: {e}. Returning raw text.")
        return " ".join(raw_text.split())

def generate_test(content_for_test):
    """
    Uses the Gemini API to generate 1 to 3 multiple-choice questions based on the provided content.
    The response is expected in a specific JSON format.
    Ensures at least one quiz is returned if content is sufficient.
    """
    if not content_for_test.strip() or len(content_for_test.split()) < 100: # Require some content for a meaningful test
        return []

    # Updated prompt to ask for 1 to 3 questions
    prompt = f"""Generate 1 to 3 multiple-choice questions based on the following text. For each question, provide 4 options, with one correct answer. Also provide a concise explanation for the correct answer. Format the output as a JSON array of objects, where each object has the following structure:
{{
  "question": "Your question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "Correct Option Text",
  "explanation": "Explanation for the correct answer."
}}

Text: {content_for_test}"""

    try:
        response = model.generate_content(prompt)
        cleaned_response_text = re.sub(r'```json\n(.*)\n```', r'\1', response.text, flags=re.DOTALL)
        tests_data = json.loads(cleaned_response_text)

        # Validate that it's a list of tests and each test has the correct structure
        if isinstance(tests_data, list) and all(
            isinstance(test, dict) and
            all(k in test for k in ["question", "options", "correct_answer", "explanation"]) and
            isinstance(test["options"], list) and len(test["options"]) == 4
            for test in tests_data
        ):
            if len(tests_data) > 0: # Ensure at least one valid test was generated
                return tests_data
            else:
                print("  - Gemini API returned an empty list of valid tests. Returning generic quiz.")
                return [{
                    "question": "What is a key concept from this section?",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correct_answer": "Option 1",
                    "explanation": "This is a placeholder quiz because the AI could not generate a specific one."
                }]
        print(f"  - Gemini API returned invalid test JSON structure: {cleaned_response_text}. Returning generic quiz.")
        return [{
            "question": "What is a key concept from this section?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_answer": "Option 1",
            "explanation": "This is a placeholder quiz because the AI returned an invalid structure."
        }]
    except json.JSONDecodeError:
        print(f"  - Gemini API response was not valid JSON after cleaning: {cleaned_response_text}. Returning generic quiz.")
        return [{
            "question": "What is a key concept from this section?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_answer": "Option 1",
            "explanation": "This is a placeholder quiz because the AI response was not valid JSON."
        }]
    except Exception as e:
        print(f"  - Gemini API error during test generation: {e}. Returning generic quiz.")
        return [{
            "question": "What is a key concept from this section?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_answer": "Option 1",
            "explanation": "This is a placeholder quiz because of an API error during generation."
        }]
