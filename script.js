let state = {
    apiBase: localStorage.getItem('blixa_url') || 'https://openrouter.ai/api/v1',
    apiKey: localStorage.getItem('blixa_key') || '',
    model: 'google/gemini-2.0-flash-001',
    chats: JSON.parse(localStorage.getItem('blixa_chats')) || [],
    currentChatId: null,
    isDarkMode: localStorage.getItem('blixa_theme') === 'dark'
};

const elements = {
    chatContainer: document.getElementById('chat-container'),
    chatList: document.getElementById('chat-list'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    welcomeView: document.getElementById('welcome-view'),
    loader: document.getElementById('loader')
};

// Start System
window.onload = () => {
    lucide.createIcons();
    if (state.isDarkMode) document.documentElement.classList.add('dark');
    document.getElementById('api-url-input').value = state.apiBase;
    document.getElementById('api-key-input').value = state.apiKey;
    renderChatList();
    
    setTimeout(() => {
        elements.loader.style.opacity = '0';
        setTimeout(() => elements.loader.style.display = 'none', 500);
    }, 800);
};

// UI Handlers
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
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

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function saveSettings() {
    state.apiBase = document.getElementById('api-url-input').value;
    state.apiKey = document.getElementById('api-key-input').value;
    localStorage.setItem('blixa_url', state.apiBase);
    localStorage.setItem('blixa_key', state.apiKey);
    closeModal('settings-modal');
}

function renderChatList() {
    elements.chatList.innerHTML = state.chats.slice().reverse().map(chat => `
        <div class="p-3 rounded-xl cursor-pointer transition-all dark:text-slate-400 ${state.currentChatId === chat.id ? 'bg-brand-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/5'}" onclick="loadChat(${chat.id})">
            <span class="truncate text-xs font-bold block">${chat.title}</span>
        </div>
    `).join('');
}

async function handleSend() {
    const text = elements.userInput.value.trim();
    if (!text) return;

    if (!state.currentChatId) {
        state.currentChatId = Date.now();
        state.chats.push({ id: state.currentChatId, title: text.substring(0, 20), messages: [] });
    }

    const chat = state.chats.find(c => c.id === state.currentChatId);
    chat.messages.push({ role: 'user', content: text });
    appendBubble('user', text);
    
    elements.userInput.value = '';
    autoResize(elements.userInput);
    elements.welcomeView.classList.add('hidden');

    const aiMsgId = appendBubble('assistant', '...');
    const response = await fetch(`${state.apiBase}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${state.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ "model": state.model, "messages": chat.messages })
    });
    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    document.getElementById(aiMsgId).innerHTML = marked.parse(reply);
    chat.messages.push({ role: 'assistant', content: reply });
    localStorage.setItem('blixa_chats', JSON.stringify(state.chats));
    renderChatList();
}

function appendBubble(role, text) {
    const id = 'm-' + Math.random().toString(36).substr(2, 9);
    const bubble = `<div class="flex flex-col"><div class="bubble bubble-${role}"><div id="${id}">${role === 'user' ? text : marked.parse(text)}</div></div></div>`;
    elements.chatContainer.insertAdjacentHTML('beforeend', bubble);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    return id;
}

function newChat() {
    state.currentChatId = null;
    elements.chatContainer.innerHTML = '';
    elements.chatContainer.appendChild(elements.welcomeView);
    elements.welcomeView.classList.remove('hidden');
}

function goHome() { location.reload(); }
