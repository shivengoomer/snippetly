// Handle dragging and dropping images into the app
const dropZone = document.getElementById('dropZone');
const popupZone = document.getElementById('popupZone');
const closePopupButton = document.getElementById('closePopupButton');
const captureScreenButton = document.getElementById('captureScreenButton');
let lastClipboardContent = '';

// Automatically save clipboard content if it changes
document.addEventListener('click', async () => {
    try {
        const clipboardContent = await navigator.clipboard.readText();
        if (clipboardContent && clipboardContent !== lastClipboardContent) {
            lastClipboardContent = clipboardContent;
            saveSnippet(clipboardContent);
            console.log('Clipboard content saved:', clipboardContent);
        }
    } catch (err) {
        console.error('Failed to read from clipboard:', err);
    }
});

// Handle opening of the drag-and-drop image popup
if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragging');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith('image/'));

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                saveSnippet(event.target.result); // Save base64 encoded image
                openImagePopup(); // Open the popup after saving
            };
            reader.readAsDataURL(imageFile);
        } else {
            alert('Please drop an image file!');
        }
    });
}

// Open the drag-to-save popup for images
function openImagePopup() {
    if (popupZone) {
        popupZone.style.display = 'block';  // Show the popup
    }
}

// Close the drag-to-save popup for images
if (closePopupButton) {
    closePopupButton.addEventListener('click', () => {
        if (popupZone) {
            popupZone.style.display = 'none';  // Hide the popup
        }
    });
}

// Save snippet (text or image) to local storage
function saveSnippet(snippet) {
    chrome.storage.local.get({ snippets: [] }, (data) => {
        const snippets = data.snippets;
        if (!snippets.includes(snippet)) { // Avoid duplicates
            snippets.push(snippet);
            chrome.storage.local.set({ snippets: snippets }, loadSnippets); // Load snippets after saving
        }
    });
}

// Load snippets and display them in the list
function loadSnippets() {
    chrome.storage.local.get({ snippets: [] }, (data) => {
        const snippetList = document.getElementById('snippetList');
        snippetList.innerHTML = ''; // Clear existing snippets

        if (data.snippets.length === 0) {
            snippetList.innerHTML = '<li class="no-snippets">No snippets saved</li>';
            return;
        }

        data.snippets.forEach((snippet, index) => {
            const li = document.createElement('li');

            // If the snippet is a base64-encoded image, display it as an image
            if (snippet.startsWith('data:image')) {
                const img = document.createElement('img');
                img.src = snippet;
                img.alt = 'Saved Snippet Image';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                li.appendChild(img);
            } else {
                li.textContent = snippet;
            }

            // Add a remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-button';
            removeButton.addEventListener('click', () => removeSnippet(index));

            li.appendChild(removeButton);
            snippetList.appendChild(li);
        });
    });
}

// Remove snippet from local storage
function removeSnippet(index) {
    chrome.storage.local.get({ snippets: [] }, (data) => {
        const snippets = data.snippets;
        snippets.splice(index, 1); // Remove snippet at the specified index
        chrome.storage.local.set({ snippets: snippets }, loadSnippets); // Save updated list
    });
}

// Capture screenshot and save it as a snippet
function captureScreen() {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (screenshotUrl) => {
        saveSnippet(screenshotUrl); // Save screenshot as base64 image
    });
}

// Call captureScreen when a button is clicked
if (captureScreenButton) {
    captureScreenButton.addEventListener('click', captureScreen);
}

// Load snippets on popup open
loadSnippets();