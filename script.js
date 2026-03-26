// --- ඔයාගේ Cloudflare Worker URL එක මෙතන දාන්න ---
const WORKER_URL = "https://my-ai-backend.freyaendicott.workers.dev";
        
let currentImageUrl = null; // for text-to-image preview
let rawContentData = "";
let rawPromptData = "";
let rawVisionData = ""; // for vision result
let uploadedImageBase64 = ""; // Global variable to store selected image base64
let uploadedImageMime = ""; // Global variable to store image MIME type

// --- Tab Switching Logic (Now handles Vision Tab) ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('text-blue-600', 'font-bold', 'border-b-4', 'border-blue-600');
        btn.classList.add('text-slate-500', 'font-semibold');
    });
    const activeBtn = document.getElementById('btn-' + tabId);
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-500', 'font-semibold');
        activeBtn.classList.add('text-blue-600', 'font-bold', 'border-b-4', 'border-blue-600');
    }
}

// --- 1. Prompt Master Logic ---
async function generatePrompt() { /* ... same as before ... */ }

// --- 2. Image Studio Logic ---
async function generateImage() { /* ... same as before ... */ }
function downloadImage() { /* ... same as before ... */ }

// --- 3. Content Manager Logic (7-Phase Prompt Builder) ---
async function generateContentStrategy() { /* ... same as before ... */ }


// --- NEW: 4. Vision Master (Image-to-Prompt) Logic ---

// Function handle selecting file from input
function handleImageSelect(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('uploadPreview');
    const placeholder = document.getElementById('uploadPlaceholder');

    if (!file) return;

    uploadedImageMime = file.type;
    const reader = new FileReader();

    // Convert file to Base64
    reader.onload = function(e) {
        // e.target.result looks like: "data:image/jpeg;base64,/9j/4..."
        const fullBase64 = e.target.result;
        // Extract only the raw base64 data string
        uploadedImageBase64 = fullBase64.split(',')[1];
        
        // Show preview image
        preview.src = fullBase64;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Function send base64 image to backend for description
async function extractPrompt() {
    if (!uploadedImageBase64) return alert("Please upload an image first!");

    const btn = document.getElementById('extractBtn');
    const resultBox = document.getElementById('visionResult');
    
    btn.disabled = true;
    btn.innerText = "Analyzing Image... (10-20s)";
    resultBox.innerHTML = "<p class='text-blue-500 font-semibold animate-pulse'>Gemini Vision is analyzing textures, lighting, subject, and camera details... Please wait.</p>";

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "describe_image", 
                image_data: uploadedImageBase64,
                mime_type: uploadedImageMime
            })
        });
        
        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        const data = await response.json();
        rawVisionData = data.result || data.error;
        
        // Render markdown result beautifully
        resultBox.innerHTML = marked.parse(rawVisionData); 
    } catch (err) {
        resultBox.innerHTML = `<p class='text-red-500'>Connection Error: ${err.message}. Ensure image size is under 4MB and try again.</p>`;
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerText = "Extract Master Prompt 👁️";
    }
}


// --- 5. Store Master Logic (Updated to save vision results too) ---
function saveToStore(type, content) { /* ... same as before ... */ }
function loadStore() { /* ... same as before ... */ }
function clearStore() { /* ... same as before ... */ }

// Copy text helper
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}

// Initialize the store on page load
loadStore();
