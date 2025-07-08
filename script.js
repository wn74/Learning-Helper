/*
  script.js
  This file contains the logic for the Uni-Docs project.
  - It loads the course data from data.json, with a fallback to placeholder data.
  - It populates the sidebar with module and page navigation.
  - It handles displaying text content for each page, now with Markdown rendering.
  - It implements the search functionality.
*/

// --- 1. Placeholder Data ---
// This is used if `data.json` cannot be loaded.
// Content now includes Markdown for demonstration.
const placeholderData = {
    "modules": [
        {
            "name": "CS101: Intro to Computer Science",
            "pages": [
                {
                    "id": "cs101_page1",
                    "title": "What is a Computer?",
                    "content": "# Introduction to Computers\n\nA computer is an **electronic device** that manipulates information, or data. It has the ability to:\n\n*   Store data\n*   Retrieve data\n*   Process data\n\n## Common Uses\n\nYou can use a computer to:\n\n1.  Type documents\n2.  Send email\n3.  Play games\n4.  Browse the Web\n\nIt also can be used to edit or create spreadsheets, presentations, and even videos.\n\n```python\nprint(\"Hello, Computer!\")\n```",
                    "tests": [
                        {
                            "question": "What is the primary function of a computer?",
                            "options": ["To generate electricity", "To perform computations", "To grow plants", "To predict the weather"],
                            "correct_answer": "To perform computations",
                            "explanation": "A computer is fundamentally a device designed to process information and perform calculations, or computations."
                        }
                    ]
                },
                {
                    "id": "cs101_page2",
                    "title": "Binary Language",
                    "content": "# Binary Code\n\nBinary code is the **fundamental language of computers**. It consists of only two symbols:\n\n*   `0` (off/false)\n*   `1` (on/true)\n\nThese binary digits, or **bits**, are used to represent all information processed by a computer, from text and images to complex programs.",
                    "tests": []
                }
            ]
        },
        {
            "name": "PHIL203: Logic and Reasoning",
            "pages": [
                {
                    "id": "phil203_page1",
                    "title": "Arguments in Logic",
                    "content": "# Understanding Logical Arguments\n\nAn **argument** in logic is a set of statements, one of which is designated as the **conclusion** and the others as **premises**. The premises are intended to provide support for the conclusion.\n\n## Key Components:\n\n*   **Premises:** Statements that provide reasons or evidence.\n*   **Conclusion:** The statement that is claimed to follow from the premises.\n\n",
                    "tests": []
                }
            ]
        }
    ]
};

// --- 2. DOM Elements ---
const moduleNav = document.getElementById('module-nav');
const contentArea = document.getElementById('content-area');
const searchInput = document.getElementById('search-input');
const sidebar = document.querySelector('.sidebar'); // Get the sidebar element

let courseData = {}; // Will hold our loaded data

// --- 3. Core Functions ---

/**
 * Renders a single page's content and its tests into the main content area.
 * @param {object} page - The page data object.
 * @param {HTMLElement} container - The parent element to append the page content to.
 * @param {string} [moduleName] - Optional: The name of the module for search results context.
 */
function renderPageContent(page, container, moduleName) {
    container.innerHTML = ''; // Clear previous content

    const pageDiv = document.createElement('div');
    pageDiv.className = 'page-content-wrapper';

    const titleElement = document.createElement('h2');
    titleElement.textContent = page.title;
    pageDiv.appendChild(titleElement);

    const contentElement = document.createElement('div');
    contentElement.className = 'page-text';
    // Use marked.parse() to convert Markdown to HTML
    contentElement.innerHTML = marked.parse(page.content);
    pageDiv.appendChild(contentElement);

    // Render tests if available
    if (page.tests && page.tests.length > 0) {
        const testsContainer = document.createElement('div');
        testsContainer.className = 'tests-container';
        testsContainer.innerHTML = '<h3>Quick Check</h3>';

        page.tests.forEach(test => {
            const testDiv = document.createElement('div');
            testDiv.className = 'test';
            testDiv.innerHTML = `<p class="test-question">${test.question}</p>`;

            const optionsList = document.createElement('div');
            optionsList.className = 'test-options';
            test.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'test-option';
                optionDiv.textContent = option;
                optionDiv.onclick = () => handleOptionClick(optionDiv, option, test.correct_answer, test.explanation);
                optionsList.appendChild(optionDiv);
            });
            testDiv.appendChild(optionsList);

            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'test-explanation';
            explanationDiv.style.display = 'none'; // Hidden by default
            testDiv.appendChild(explanationDiv);

            testsContainer.appendChild(testDiv);
        });
        pageDiv.appendChild(testsContainer);
    }
    container.appendChild(pageDiv);
}

/**
 * Handles click on a test option.
 * @param {HTMLElement} clickedOption - The option element that was clicked.
 * @param {string} selectedAnswer - The text of the selected answer.
 * @param {string} correctAnswer - The text of the correct answer.
 * @param {string} explanation - The explanation for the correct answer.
 */
function handleOptionClick(clickedOption, selectedAnswer, correctAnswer, explanation) {
    const options = clickedOption.parentNode.children;
    // Disable further clicks on options for this question
    Array.from(options).forEach(opt => {
        opt.onclick = null;
        opt.style.cursor = 'default';
    });

    const explanationDiv = clickedOption.parentNode.nextElementSibling; // Get the explanation div

    if (selectedAnswer === correctAnswer) {
        clickedOption.classList.add('correct');
        explanationDiv.textContent = `Correct! ${explanation}`;
    } else {
        clickedOption.classList.add('incorrect');
        // Highlight correct answer
        Array.from(options).forEach(opt => {
            if (opt.textContent === correctAnswer) {
                opt.classList.add('correct');
            }
        });
        explanationDiv.textContent = `Incorrect. The correct answer was: ${correctAnswer}. ${explanation}`;
    }
    explanationDiv.style.display = 'block'; // Show explanation
}

function renderModuleNav() {
    const navList = document.createElement('ul');
    courseData.modules.forEach((module, moduleIndex) => {
        const moduleListItem = document.createElement('li');
        moduleListItem.className = 'module-item'; // Add class for styling

        const moduleHeader = document.createElement('div');
        moduleHeader.className = 'module-header';
        moduleHeader.innerHTML = `<span>${module.name}</span><span class="toggle-icon">▶</span>`; // Add toggle icon
        moduleHeader.onclick = () => {
            moduleListItem.classList.toggle('collapsed');
            const icon = moduleHeader.querySelector('.toggle-icon');
            icon.textContent = moduleListItem.classList.contains('collapsed') ? '▶' : '▼';
        };
        moduleListItem.appendChild(moduleHeader);

        const pagesList = document.createElement('ul');
        pagesList.className = 'module-pages-list'; // Add class for styling
        module.pages.forEach((page, pageIndex) => {
            const pageListItem = document.createElement('li');
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = page.title;
            pageLink.onclick = () => renderPageContent(page, contentArea); // Directly render page content
            pageListItem.appendChild(pageLink);
            pagesList.appendChild(pageListItem);
        });
        moduleListItem.appendChild(pagesList);
        navList.appendChild(moduleListItem);
    });
    moduleNav.innerHTML = '';
    moduleNav.appendChild(navList);

    // Add Buy Me a Coffee link
    const buyMeACoffeeDiv = document.createElement('div');
    buyMeACoffeeDiv.className = 'buy-me-a-coffee';
    buyMeACoffeeDiv.innerHTML =  `<a href="https://coff.ee/stoff" target="_blank">Buy me a coffee ☕</a>`;
    sidebar.appendChild(buyMeACoffeeDiv);
}

// Initial display of content (e.g., first page of first module)
function displayInitialContent() {
    if (courseData.modules && courseData.modules.length > 0 && courseData.modules[0].pages && courseData.modules[0].pages.length > 0) {
        renderPageContent(courseData.modules[0].pages[0], contentArea);
    } else {
        contentArea.innerHTML = "<h2>No content found.</h2><p>Please run the processing script and ensure data.json is created with valid data.</p>";
    }
}

function performSearch() {
    const query = searchInput.value.toLowerCase();
    if (query.length < 2) {
        displayInitialContent(); // Show initial content if search is cleared
        return;
    }

    contentArea.innerHTML = `<h2>Search Results for "${searchInput.value}"</h2>`;
    let resultsFound = false;
    courseData.modules.forEach(module => {
        module.pages.forEach(page => {
            if (page.content.toLowerCase().includes(query)) {
                // For search results, we'll just display the content directly
                const searchResultDiv = document.createElement('div');
                searchResultDiv.className = 'search-result-item';
                // Make the search result clickable to load the full page
                searchResultDiv.innerHTML = `<h3><a href="#" onclick="renderPageContent(courseData.modules.find(m => m.name === '${module.name}').pages.find(p => p.id === '${page.id}'), contentArea)">${module.name} - ${page.title}</a></h3><p>${page.content.substring(0, 200)}...</p>`; // Show snippet
                contentArea.appendChild(searchResultDiv);
                resultsFound = true;
            }
        });
    });

    if (!resultsFound) {
        contentArea.innerHTML += '<p>No results found.</p>';
    }
}

/**
 * Loads data from data.json, falling back to placeholder data on error.
 */
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        courseData = await response.json();
        console.log("Successfully loaded data.json");
    } catch (error) {
        console.warn("Could not load data.json, using placeholder data.", error);
        courseData = placeholderData;
    }
    // Once data is loaded, render the application
    renderModuleNav();
    displayInitialContent();
}

// --- 4. Initial Load ---
searchInput.addEventListener('input', performSearch);
loadData(); // Start the application by loading data

// --- 5. Sidebar Toggle (Feature 2) ---
// Create a header for the sidebar that contains the toggle button
const sidebarHeader = document.createElement('div');
sidebarHeader.className = 'sidebar-header';

const sidebarToggle = document.createElement('div');
sidebarToggle.className = 'sidebar-toggle';
sidebarToggle.innerHTML = '<span class="toggle-arrow">«</span>'; // Arrow icon
sidebarToggle.onclick = () => {
    sidebar.classList.toggle('hidden');
    document.querySelector('.container').classList.toggle('sidebar-hidden');
    const arrow = sidebarToggle.querySelector('.toggle-arrow');
    arrow.textContent = sidebar.classList.contains('hidden') ? '»' : '«';
};
sidebarHeader.appendChild(sidebarToggle);
sidebar.prepend(sidebarHeader);
