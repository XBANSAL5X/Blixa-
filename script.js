// --- Core State Logic ---
let state = {
    apiBase: localStorage.getItem('blixa_url') || 'https://openrouter.ai/api/v1',
    apiKey: localStorage.getItem('blixa_key') || '',
    model: 'google/gemini-2.0-flash-001',
    chats: JSON.parse(localStorage.getItem('blixa_chats')) || [],
    currentChatId: null,
    isDarkMode: localStorage.getItem('blixa_theme') === 'dark',
    isTyping: false,
    avatar: localStorage.getItem('blixa_avatar') || null
};

const elements = {
    chatContainer: document.getElementById('chat-container'),
    chatList: document.getElementById('chat-list'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    welcomeView: document.getElementById('welcome-view'),
    terminal: document.getElementById('terminal-content'),
    loader: document.getElementById('loader'),
    vOverlay: document.getElementById('voice-overlay'),
    vTranscript: document.getElementById('v-transcript')
};

window.onload = () => {
    lucide.createIcons();
    if (state.isDarkMode) document.documentElement.classList.add('dark');
    if (state.avatar) document.getElementById('user-avatar-preview').src = state.avatar;
    
    // Add null checks for modal elements
    const urlInput = document.getElementById('api-url-input');
    const keyInput = document.getElementById('api-key-input');
    if(urlInput) urlInput.value = state.apiBase;
    if(keyInput) keyInput.value = state.apiKey;
    
    renderChatList();
    setInterval(selfHealingMonitor, 5000);
    
    setTimeout(() => {
        elements.loader.style.opacity = '0';
        setTimeout(() => elements.loader.remove(), 500);
    }, 1000);
};

// --- Terminal & Utility Functions ---
function writeToTerminal(text, type = 'info') {
    if (!elements.terminal) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerText = `> ${new Date().toLocaleTimeString()}: ${text}`;
    elements.terminal.appendChild(line);
    elements.terminal.scrollTop = elements.terminal.scrollHeight;
}

function selfHealingMonitor() {
    writeToTerminal("Heartbeat pulse detected... OK", "info");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
}

function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('blixa_theme', state.isDarkMode ? 'dark' : 'light');
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    const charCounter = document.getElementById('char-counter');
    if(charCounter) {
        charCounter.innerText = `${textarea.value.length} / 4000`;
    }
    elements.sendBtn.disabled = !textarea.value.trim();
}

// Dummy functions for navigation
function goHome() {
    location.reload();
}

function newChat() {
    alert("New Chat Initialized");
    // Add logic to clear chat or create new ID
}

function handleSend() {
    const text = elements.userInput.value.trim();
    if (text) {
        alert("Message Sending: " + text);
        elements.userInput.value = '';
        autoResize(elements.userInput);
    }
}

// Voice Mode Logic (Basics)
function startVoiceMode() {
    elements.vOverlay.classList.remove('hidden');
    elements.vOverlay.classList.add('flex');
}

function stopVoiceMode() {
    elements.vOverlay.classList.add('hidden');
    elements.vOverlay.classList.remove('flex');
}
