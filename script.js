document.addEventListener('DOMContentLoaded', () => {
    // Auto-adjust textarea height
    const textareas = document.querySelectorAll('.chat-input');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // Allow sending message with Enter key (but allow Shift+Enter for new line)
    textareas.forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const userId = textarea.id.replace('user', '').replace('Input', '');
                sendMessage(parseInt(userId));
            }
        });
    });
});

// Simple encryption simulation
function encryptMessage(text) {
    // Base64 encoding for simulation (not real encryption)
    return btoa(unescape(encodeURIComponent(text)));
}

function decryptText(encryptedText) {
    try {
        return decodeURIComponent(escape(atob(encryptedText)));
    } catch (e) {
        return encryptedText; // Return as-is if not base64 encoded
    }
}

// Send message from a user
function sendMessage(userId) {
    const inputEl = document.getElementById(`user${userId}Input`);
    const chatEl = document.getElementById(`user${userId}Chat`);
    const otherUserId = userId === 1 ? 2 : 1;
    const otherChatEl = document.getElementById(`user${otherUserId}Chat`);

    const messageText = inputEl.value.trim();
    if (messageText) {
        // Add outgoing message to sender's chat
        addMessageToChat(chatEl, messageText, 'outgoing', userId === 1 ? 'You' : 'Professor Smith');

        // Add encrypted incoming message to receiver's chat
        const encryptedText = encryptMessage(messageText);
        addMessageToChat(otherChatEl, encryptedText, 'incoming', userId === 1 ? 'Student' : 'Professor Smith', true);

        // Clear input and reset height
        inputEl.value = '';
        inputEl.style.height = 'auto';

        // Scroll to bottom of both chat boxes
        chatEl.scrollTop = chatEl.scrollHeight;
        otherChatEl.scrollTop = otherChatEl.scrollHeight;
    }
}

// Add message to chat box
function addMessageToChat(chatEl, text, type, sender, isEncrypted = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageElement.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
        <div class="message-info">
            <span>${type === 'outgoing' ? 'You' : sender}</span>
            <span>${timeString}</span>
        </div>
    `;

    if (isEncrypted && type === 'incoming') {
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('message-actions');
        actionsDiv.innerHTML = `
            <button onclick="decryptMessage(this)"><i class="fas fa-unlock"></i> Decrypt</button>
        `;
        messageElement.appendChild(actionsDiv);
    }

    chatEl.appendChild(messageElement);
}

// Decrypt message when button clicked
function decryptMessage(button) {
    const messageContent = button.closest('.message').querySelector('.message-content p');
    const originalText = messageContent.textContent;
    const decryptedText = decryptText(originalText);

    if (decryptedText !== originalText) {
        messageContent.textContent = decryptedText;
        button.innerHTML = '<i class="fas fa-lock"></i> Encrypted';
        button.onclick = function() {
            messageContent.textContent = originalText;
            button.innerHTML = '<i class="fas fa-unlock"></i> Decrypt';
            button.onclick = function() {
                decryptMessage(button);
            };
        };
    }
}

// Encrypt all messages in a chat
function encryptAll(userId) {
    const chatEl = document.getElementById(`user${userId}Chat`);
    const messages = chatEl.querySelectorAll('.message');

    messages.forEach(message => {
        if (message.classList.contains('outgoing')) {
            const contentEl = message.querySelector('.message-content p');
            const currentText = contentEl.textContent;

            // Only encrypt if not already encrypted
            try {
                atob(currentText);
                // If we get here, it's already base64 encoded
            } catch (e) {
                // Not encrypted yet, so encrypt it
                contentEl.textContent = encryptMessage(currentText);
            }
        }
    });
}

// Decrypt all messages in a chat
function decryptAll(userId) {
    const chatEl = document.getElementById(`user${userId}Chat`);
    const messages = chatEl.querySelectorAll('.message');

    messages.forEach(message => {
        const contentEl = message.querySelector('.message-content p');
        const currentText = contentEl.textContent;
        const decryptedText = decryptText(currentText);

        if (decryptedText !== currentText) {
            contentEl.textContent = decryptedText;
        }

        // Update decrypt buttons
        const decryptBtn = message.querySelector('.message-actions button');
        if (decryptBtn) {
            decryptBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypted';
            decryptBtn.onclick = function() {
                contentEl.textContent = currentText;
                decryptBtn.innerHTML = '<i class="fas fa-unlock"></i> Decrypt';
                decryptBtn.onclick = function() {
                    decryptMessage(decryptBtn);
                };
            };
        }
    });
}
