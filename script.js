// --- SYSTEM STATE ---
let state = {
    apiBase: localStorage.getItem('blixa_url') || 'https://openrouter.ai/api/v1',
    apiKey: localStorage.getItem('blixa_key') || '',
    model: 'google/gemini-2.0-flash-001',
    chats: JSON.parse(localStorage.getItem('blixa_chats')) || [],
    currentChatId: null,
    isDarkMode: localStorage.getItem('blixa_theme') === 'dark',
    isTyping: false
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

// --- INITIALIZATION ---
window.onload = () => {
    lucide.createIcons();
    if (state.isDarkMode) document.documentElement.classList.add('dark');
    document.getElementById('api-url-input').value = state.apiBase;
    document.getElementById('api-key-input').value = state.apiKey;
    renderChatList();
    
    setTimeout(() => {
        elements.loader.style.opacity = '0';
        setTimeout(() => elements.loader.remove(), 700);
        writeTerminal("Core Logic Initialized", "success");
    }, 1200);
};

// --- UTILITIES ---
function writeTerminal(text, type = 'success') {
    const line = document.createElement('div');
    line.className = `p-1 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
    line.innerText = `> [${new Date().toLocaleTimeString()}] ${text}`;
    elements.terminal.prepend(line);
}

function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('blixa_theme', state.isDarkMode ? 'dark' : 'light');
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    elements.sendBtn.disabled = !textarea.value.trim();
}

// --- CHAT LOGIC ---
function renderChatList() {
    elements.chatList.innerHTML = state.chats.slice().reverse().map(chat => `
        <div class="p-4 rounded-2xl cursor-pointer transition-all ${state.currentChatId === chat.id ? 'bg-brand-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'}" onclick="loadChat(${chat.id})">
            <span class="truncate text-xs font-black uppercase block">${chat.title}</span>
        </div>
    `).join('');
    lucide.createIcons();
}

async function handleSend() {
    const val = elements.userInput.value.trim();
    if (!val || state.isTyping) return;

    if (!state.currentChatId) {
        state.currentChatId = Date.now();
        state.chats.push({ id: state.currentChatId, title: val.substring(0, 20), messages: [] });
    }

    const chat = state.chats.find(c => c.id === state.currentChatId);
    chat.messages.push({ role: 'user', content: val });
    appendUI('user', val);
    
    elements.userInput.value = '';
    autoResize(elements.userInput);
    state.isTyping = true;

    const aiId = appendUI('assistant', 'Consulting Neural Core...');
    const reply = await callAPI(chat.messages);
    
    document.getElementById(aiId).innerHTML = marked.parse(reply);
    chat.messages.push({ role: 'assistant', content: reply });
    localStorage.setItem('blixa_chats', JSON.stringify(state.chats));
    state.isTyping = false;
}

async function callAPI(messages) {
    try {
        const response = await fetch(`${state.apiBase}/chat/completions`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${state.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ "model": state.model, "messages": messages })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response.";
    } catch (e) {
        return "ERROR: Connection failed.";
    }
}

function appendUI(role, text) {
    const id = 'm-' + Math.random().toString(36).substr(2, 9);
    const isUser = role === 'user';
    const html = `
        <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full">
            <div class="bubble ${isUser ? 'bubble-user' : 'bubble-ai'}">
                <div id="${id}">${isUser ? text : text}</div>
            </div>
        </div>`;
    elements.chatContainer.insertAdjacentHTML('beforeend', html);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    return id;
}

// --- MODALS & VOICE ---
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function saveSettings() {
    state.apiBase = document.getElementById('api-url-input').value;
    state.apiKey = document.getElementById('api-key-input').value;
    localStorage.setItem('blixa_url', state.apiBase);
    localStorage.setItem('blixa_key', state.apiKey);
    closeModal('settings-modal');
}
