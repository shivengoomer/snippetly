document.addEventListener("DOMContentLoaded", () => {
  const clipboardHistory = [];
  const maxClipboardItems = 10;

  const searchClipboard = document.getElementById("searchClipboard");
  const clipboardHistoryList = document.getElementById("clipboardHistory");
  const codeSnippetInput = document.getElementById("codeSnippet");
  const saveSnippetButton = document.getElementById("saveSnippetButton");

  // Load clipboard history from storage
  chrome.storage.local.get(["clipboardHistory"], (result) => {
    if (result.clipboardHistory) {
      clipboardHistory.push(...result.clipboardHistory);
      renderClipboardHistory();
    }
  });

  // Button to read clipboard
  document.getElementById("readClipboardButton").addEventListener("click", readClipboard);

  // Function to read clipboard
  function readClipboard() {
    navigator.clipboard.read().then((items) => {
      items.forEach((item) => {
        if (item.types.includes("text/plain")) {
          item.getType("text/plain").then((blob) => {
            blob.text().then((text) => {
              addClipboardEntry('text', text);
            });
          });
        } else if (item.types.includes("image/png")) {
          item.getType("image/png").then((blob) => {
            const reader = new FileReader();
            reader.onload = function (event) {
              const imageUrl = event.target.result;
              addClipboardEntry('image', imageUrl);
            };
            reader.readAsDataURL(blob);
          });
        }
      });
    }).catch((err) => {
      console.error("Error reading clipboard:", err);
      alert("Failed to read clipboard. Please check permissions.");
    });
  }

  // Add entry to clipboard history
  function addClipboardEntry(type, content) {
    if (!clipboardHistory.find(entry => entry.type === type && entry.content === content)) {
      if (clipboardHistory.length >= maxClipboardItems) clipboardHistory.shift();
      clipboardHistory.push({ type, content });
      chrome.storage.local.set({ clipboardHistory }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving clipboard history:", chrome.runtime.lastError);
        }
      });
      renderClipboardHistory();
    }
  }

  // Render clipboard history
  function renderClipboardHistory() {
    clipboardHistoryList.innerHTML = "";
    clipboardHistory.forEach((item) => {
      const li = document.createElement("li");
      if (item.type === "text") {
        li.textContent = item.content;
      } else if (item.type === "image") {
        const img = document.createElement("img"); // Fixed syntax error
        img.src = item.content;
        img.style.maxWidth = "100px"; // Limit image size for better display
        li.appendChild(img);
      }
      clipboardHistoryList.appendChild(li);
    });
  }

  // Save code snippet
  saveSnippetButton.addEventListener("click", () => {
    const codeSnippet = codeSnippetInput.value.trim();
    if (codeSnippet) {
      chrome.storage.local.get(["codeSnippets"], (result) => {
        const snippets = result.codeSnippets || [];
        if (!snippets.includes(codeSnippet)) { // Prevent duplicates
          snippets.push(codeSnippet);
          chrome.storage.local.set({ codeSnippets: snippets }, () => {
            codeSnippetInput.value = ""; // Clear input after saving
            alert("Snippet saved!");
          });
        } else {
          alert(" Snippet already exists!");
        }
      });
    } else {
      alert("Please enter a code snippet before saving.");
    }
  });

  // Search clipboard history
  searchClipboard.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    clipboardHistoryList.innerHTML = ""; // Clear the list before rendering filtered results
    clipboardHistory.forEach((item) => {
      if (item.type === "text" && item.content.toLowerCase().includes(query)) {
        const li = document.createElement("li");
        li.textContent = item.content;
        clipboardHistoryList.appendChild(li);
      } else if (item.type === "image" && item.content.toLowerCase().includes(query)) {
        const li = document.createElement("li");
        const img = document.createElement("img");
        img.src = item.content;
        img.style.maxWidth = "100px"; // Limit image size for better display
        li.appendChild(img);
        clipboardHistoryList.appendChild(li);
      }
    });
  });
});