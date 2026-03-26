// --- ඔයාගේ Cloudflare Worker URL එක මෙතන දාන්න ---
const WORKER_URL = "https://my-ai-backend.freyaendicott.workers.dev";
        
let currentImageUrl = null;
let rawContentData = "";
let rawPromptData = "";

// --- Tab Switching Logic ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('text-blue-600', 'font-bold', 'border-b-4', 'border-blue-600');
        btn.classList.add('text-slate-500', 'font-semibold');
    });
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.classList.remove('text-slate-500', 'font-semibold');
    activeBtn.classList.add('text-blue-600', 'font-bold', 'border-b-4', 'border-blue-600');
}

// --- 1. Prompt Master Logic ---
async function generatePrompt() {
    const basicIdea = document.getElementById('basicIdea').value;
    const btn = document.getElementById('genBtn');
    const resultBox = document.getElementById('enhancedPrompt');
    if (!basicIdea) return alert("Please enter basic idea!");
    
    btn.innerText = "Processing...";
    resultBox.innerHTML = "<p class='text-slate-500'>Generating...</p>";
    
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate_text", prompt: basicIdea })
        });
        const data = await response.json();
        rawPromptData = data.result || data.error;
        resultBox.innerHTML = marked.parse(rawPromptData); 
    } catch (err) { resultBox.innerHTML = "<p class='text-red-500'>Error connecting to backend</p>"; }
    btn.innerText = "Enhance Prompt ✨";
}

// --- 2. Image Studio Logic ---
async function generateImage() {
    const userPrompt = document.getElementById('imagePrompt').value;
    if (!userPrompt) return alert("Please enter a prompt!");

    const qualityPrompt = document.getElementById('imgQuality').value;
    const finalPrompt = userPrompt + ", " + qualityPrompt; 
    const ratioStr = document.getElementById('imgRatio').value;
    const [width, height] = ratioStr.split('x').map(Number); 

    const btn = document.getElementById('imgBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('imgStatus');
    const imgEl = document.getElementById('resultImage');
    const placeholder = document.getElementById('imagePlaceholder');

    btn.disabled = true;
    btn.innerText = "Processing...";
    downloadBtn.classList.add('hidden');
    status.innerText = "Generating high-quality image... (15-40s)";
    imgEl.classList.add('hidden');
    placeholder.classList.remove('hidden');

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate_image", prompt: finalPrompt, width: width, height: height })
        });
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            alert(data.error);
        } else {
            const blob = await response.blob();
            if(currentImageUrl) URL.revokeObjectURL(currentImageUrl);
            currentImageUrl = URL.createObjectURL(blob);
            
            imgEl.src = currentImageUrl;
            imgEl.classList.remove('hidden');
            placeholder.classList.add('hidden');
            downloadBtn.classList.remove('hidden');
        }
    } catch (error) {
        alert("Connection Error. Please try again.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Generate Image 🎨";
        status.innerText = "";
    }
}

function downloadImage() {
    if (!currentImageUrl) return alert("No image generated yet!");
    const ratioStr = document.getElementById('imgRatio').value;
    const timestamp = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = currentImageUrl;
    a.download = `AI_Image_${ratioStr}_${timestamp}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- 3. Content Manager Logic (7-Phase Prompt Builder) ---
async function generateContentStrategy() {
    const niche = document.getElementById('nicheInput').value;
    const btn = document.getElementById('contentBtn');
    const resultBox = document.getElementById('contentResult');
    if (!niche) return alert("Please enter a niche or topic!");

    btn.disabled = true;
    btn.innerText = "Engineering Prompts... (15-20s)";
    resultBox.innerHTML = "<p class='text-blue-500 font-semibold animate-pulse'>Analyzing niche and engineering elite 7-Phase Master Prompts for Images & Videos... Please wait.</p>";

    const strategyPrompt = `Act as an Elite Social Media Manager and Advanced AI Prompt Engineer. The user's niche is: "${niche}". 
    Provide a beautifully formatted Markdown response divided into TWO main sections.
    ## SECTION 1: Niche Strategy
    1. Target Audience Analysis
    2. Top 15 Viral Keywords & SEO Tags
    3. 7-Day Content Calendar (Markdown Table: Day | Topic | Format | Viral Hook)
    
    ## SECTION 2: Auto-Generated 7-Phase Master Prompts
    Based on the exact niche "${niche}", generate TWO highly detailed "7-Phase Master Prompts". One for IMAGES and One for SHORT VIDEOS. Put EACH inside a markdown code block (\`\`\`). Follow this exact 7-Phase structure for both:
    [Role: ELITE expert]
    [Mission: Generate COMPLETE viral post packages]
    [Content Style]
    [Content Categories]
    PHASE 1 - VIRAL IDEA GENERATION
    PHASE 2 - FORMAT SELECTION
    PHASE 3 - AI GENERATION PROMPTS (Highly technical AI prompts)
    PHASE 4 - VIRAL CAPTION
    PHASE 5 - TEXT OVERLAY
    PHASE 6 - HASHTAGS
    PHASE 7 - POSTING STRATEGY
    OUTPUT FORMAT`;

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate_text", prompt: strategyPrompt })
        });
        const data = await response.json();
        rawContentData = data.result || data.error;
        resultBox.innerHTML = marked.parse(rawContentData); 
    } catch (err) {
        resultBox.innerHTML = "<p class='text-red-500'>Connection Error. Please try again.</p>";
    } finally {
        btn.disabled = false;
        btn.innerText = "Generate Strategy & Prompts 🚀";
    }
}

// --- 4. Store Master Logic ---
function saveToStore(type, content) {
    if (!content || content.includes("Analyzing")) return alert("Nothing valid to save!");
    let store = JSON.parse(localStorage.getItem('myAIStore')) || [];
    store.unshift({ type: type, content: content, date: new Date().toLocaleString() });
    localStorage.setItem('myAIStore', JSON.stringify(store));
    alert("Saved successfully to Store Master!");
    loadStore();
}

function loadStore() {
    let store = JSON.parse(localStorage.getItem('myAIStore')) || [];
    const listDiv = document.getElementById('savedItemsList');
    listDiv.innerHTML = "";
    if(store.length === 0) {
        listDiv.innerHTML = "<p class='text-slate-400 italic'>No saved items yet.</p>";
        return;
    }
    store.forEach((item) => {
        const formattedContent = marked.parse(item.content);
        listDiv.innerHTML += `
            <div class="p-6 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
                <div class="flex items-center mb-4 border-b border-slate-200 pb-3">
                    <span class="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">${item.type}</span>
                    <span class="text-xs text-slate-500 ml-3">${item.date}</span>
                </div>
                <div class="prose max-w-none text-sm">${formattedContent}</div>
            </div>
        `;
    });
}

function clearStore() {
    if(confirm("Are you sure you want to delete all saved items?")) {
        localStorage.removeItem('myAIStore');
        loadStore();
    }
}

// Initialize the store on page load
loadStore();
