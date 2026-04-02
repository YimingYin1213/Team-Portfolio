/**
 * AiNpc.js - Reusable AI-powered NPC conversation system
 * 
 * Provides common behaviors for conversational NPCs powered by backend Gemini API.
 * Works with DialogueSystem.js for UI display.
 * 
 * USAGE:
 * - Call AiNpc.showInteraction(npcInstance) in your NPC's interact() method
 * - Requires spriteData properties: expertise, chatHistory, dialogues, knowledgeBase
 * - DialogueSystem cycles through dialogues array sequentially on each interaction
 * 
 * BACKEND API:
 * - POST /api/ainpc/prompt   - Send message to NPC, get response
 * - POST /api/ainpc/greeting - Get NPC greeting and reset conversation
 * - POST /api/ainpc/reset    - Clear conversation history
 * - GET  /api/ainpc/test     - Test API availability
 */

import DialogueSystem from './DialogueSystem.js';
import { pythonURI, fetchOptions } from '../../api/config.js';

class AiNpc {
    /**
     * Build a useful local response from NPC knowledge when backend is unavailable.
     * @param {Object} spriteData - The NPC sprite data
     * @param {string} userMessage - User message
     * @returns {string} Local fallback response
     */
    static generateLocalResponse(spriteData, userMessage) {
        const expertise = spriteData?.expertise || 'this topic';
        const knowledge = spriteData?.knowledgeBase?.[expertise] || [];
        const prompt = (userMessage || '').toLowerCase();

        if (!Array.isArray(knowledge) || knowledge.length === 0) {
            return `I can help with ${expertise}, but I need a clearer question.`;
        }

        // Basic keyword overlap scoring between user prompt and available Q/A entries.
        const keywords = prompt
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        let bestTopic = null;
        let bestScore = -1;

        knowledge.forEach(topic => {
            const haystack = `${topic.question || ''} ${topic.answer || ''}`.toLowerCase();
            const score = keywords.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
            if (score > bestScore) {
                bestScore = score;
                bestTopic = topic;
            }
        });

        if (!bestTopic || bestScore <= 0) {
            const randomTopic = knowledge[Math.floor(Math.random() * knowledge.length)];
            return randomTopic?.answer || `Try asking me about ${expertise}.`;
        }

        return bestTopic.answer || `I know about ${expertise}, ask me another angle.`;
    }

    /**
     * Main entry point - Shows full AI interaction dialog for an NPC
     * Creates DialogueSystem with NPC's dialogues and uses cycling behavior
     * @param {Object} npcInstance - The NPC instance (with this.spriteData, this.gameControl)
     */
    static showInteraction(npcInstance) {
        if (!npcInstance || !npcInstance.spriteData) return;

        const npc = npcInstance;
        const data = npc.spriteData;
        if (!Array.isArray(data.chatHistory)) data.chatHistory = [];
        if (!Array.isArray(data.dialogues) || data.dialogues.length === 0) {
            data.dialogues = [data.greeting || 'Hello!'];
        }
        if (!data.expertise) data.expertise = 'general';

        // Close any existing dialogue
        if (npc.dialogueSystem?.isDialogueOpen()) {
            npc.dialogueSystem.closeDialogue();
        }

        // Initialize DialogueSystem if needed with NPC's dialogues
        if (!npc.dialogueSystem) {
            npc.dialogueSystem = new DialogueSystem({
                dialogues: data.dialogues || [data.greeting || "Hello!"],
                gameControl: npc.gameControl
            });
        }

        // Use DialogueSystem's cycling showRandomDialogue method
        if (typeof npc.dialogueSystem.showRandomDialogue === 'function') {
            npc.dialogueSystem.showRandomDialogue(data.id, data.src, data);
        } else if (typeof npc.dialogueSystem.showDialogue === 'function') {
            const firstDialogue = data.dialogues[0] || data.greeting || 'Hello!';
            npc.dialogueSystem.showDialogue(firstDialogue, data.id, data.src, data);
        } else {
            return;
        }

        // Create and attach AI chat UI
        const ui = AiNpc.createChatUI(data);
        AiNpc.attachEventHandlers(npc, data, ui);
        AiNpc.attachToDialogue(npc.dialogueSystem, ui.container);
    }

    /**
     * Create the AI chat UI (input field, buttons, response area)
     * @param {Object} spriteData - The NPC sprite data
     * @returns {Object} UI elements { container, inputField, historyBtn, responseArea }
     */
    static createChatUI(spriteData) {
        const container = document.createElement('div');
        container.className = 'ai-npc-container';

        const inputField = document.createElement('textarea');
        inputField.className = 'ai-npc-input';
        
        // Use a random question from knowledgeBase as placeholder hint, or fall back to generic
        let placeholder = `Ask about ${spriteData.expertise}...`;
        const topics = spriteData.knowledgeBase?.[spriteData.expertise] || [];
        if (topics.length > 0) {
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            placeholder = randomTopic.question;
        }
        inputField.placeholder = placeholder;
        inputField.rows = 2;

        const buttonRow = document.createElement('div');
        buttonRow.className = 'ai-npc-button-row';

        const historyBtn = document.createElement('button');
        historyBtn.textContent = '📋 Chat History';
        historyBtn.className = 'ai-npc-history-btn';

        const responseArea = document.createElement('div');
        responseArea.className = 'ai-npc-response-area';
        responseArea.style.display = 'none'; // Keep this one for show/hide logic

        buttonRow.appendChild(historyBtn);
        container.appendChild(inputField);
        container.appendChild(buttonRow);
        container.appendChild(responseArea);

        return { container, inputField, historyBtn, responseArea };
    }

    /**
     * Attach event handlers to UI elements
     * @param {Object} npcInstance - The NPC instance
     * @param {Object} spriteData - The NPC sprite data
     * @param {Object} ui - UI elements from createChatUI
     */
    static attachEventHandlers(npcInstance, spriteData, ui) {
        const { inputField, historyBtn, responseArea } = ui;

        // History button
        historyBtn.onclick = () => AiNpc.showChatHistory(spriteData);

        // Send message function
        const sendMessage = async () => {
            const userMessage = inputField.value.trim();
            if (!userMessage) return;
            inputField.value = '';
            await AiNpc.sendPromptToBackend(spriteData, userMessage, responseArea);
        };

        // Prevent game input while typing
        AiNpc.preventGameInput(inputField);

        // Handle Enter key (Shift+Enter for new line, Enter to send)
        inputField.onkeypress = e => {
            e.stopPropagation();
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };

        // Auto-focus input field
        setTimeout(() => inputField.focus(), 100);
    }

    /**
     * Attach UI container to DialogueSystem dialogue box
     * @param {DialogueSystem} dialogueSystem - The dialogue system instance
     * @param {HTMLElement} container - The UI container to attach
     */
    static attachToDialogue(dialogueSystem, container) {
        if (!dialogueSystem || !container) return;

        const dialogueId = dialogueSystem.safeId || dialogueSystem.id;
        const dialogueBox = document.getElementById('custom-dialogue-box-' + dialogueId);
        if (dialogueBox) {
            // Remove any existing AI NPC containers first
            const existingContainers = dialogueBox.querySelectorAll('.ai-npc-container');
            existingContainers.forEach(existing => existing.remove());
            
            // Find the close button using its specific ID
            const closeBtn = document.getElementById('dialogue-close-btn-' + dialogueId) || dialogueSystem.closeBtn;
            if (closeBtn && closeBtn.parentNode === dialogueBox) {
                dialogueBox.insertBefore(container, closeBtn);
            } else {
                dialogueBox.appendChild(container);
            }
        }
    }

    /**
     * Send user prompt to backend API and display response
     * @param {Object} spriteData - The NPC sprite data
     * @param {string} userMessage - User's message
     * @param {HTMLElement} responseArea - Response display element
     */
    static async sendPromptToBackend(spriteData, userMessage, responseArea) {
        if (!Array.isArray(spriteData.chatHistory)) spriteData.chatHistory = [];
        spriteData.chatHistory.push({ role: 'user', message: userMessage });

        responseArea.textContent = 'Thinking...';
        responseArea.style.display = 'block';

        try {
            // Build knowledge context
            let knowledgeContext = '';
            const topics = spriteData.knowledgeBase?.[spriteData.expertise] || [];
            if (topics.length > 0) {
                knowledgeContext = 'Here are some example topics I can help with:\n';
                topics.slice(0, 3).forEach(t => {
                    knowledgeContext += `- ${t.question}\n`;
                });
                knowledgeContext += '\n';
            }

            const sessionId = `player-${spriteData.id}`;
            const pythonURL = pythonURI + '/api/ainpc/prompt';

            const response = await fetch(pythonURL, {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify({
                    prompt: userMessage,
                    session_id: sessionId,
                    npc_type: spriteData.expertise,
                    expertise: spriteData.expertise,
                    knowledgeContext: knowledgeContext
                })
            });

            if (!response.ok) {
                const localResponse = AiNpc.generateLocalResponse(spriteData, userMessage);
                spriteData.chatHistory.push({ role: 'ai', message: localResponse });
                AiNpc.showResponse(localResponse, responseArea);
                return;
            }

            const data = await response.json();

            if (data.status === 'error') {
                const localResponse = AiNpc.generateLocalResponse(spriteData, userMessage);
                spriteData.chatHistory.push({ role: 'ai', message: localResponse });
                AiNpc.showResponse(localResponse, responseArea);
                return;
            }

            const aiResponse = data?.response || "I'm not sure how to answer that yet.";
            spriteData.chatHistory.push({ role: 'ai', message: aiResponse });
            AiNpc.showResponse(aiResponse, responseArea);

        } catch (err) {
            console.error('Frontend error:', err);
            const localResponse = AiNpc.generateLocalResponse(spriteData, userMessage);
            spriteData.chatHistory.push({ role: 'ai', message: localResponse });
            AiNpc.showResponse(localResponse, responseArea);
        }
    }

    /**
     * Display response with typewriter effect
     * @param {string} text - Text to display
     * @param {HTMLElement} element - Element to display in
     * @param {number} speed - Typing speed in ms
     */
    static showResponse(text, element, speed = 30) {
        element.textContent = '';
        element.style.display = 'block';
        let index = 0;
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index++);
                setTimeout(type, speed);
            }
        };
        type();
    }

    /**
     * Prevent keyboard events from propagating to game
     * @param {HTMLElement} element - Input element to protect
     */
    static preventGameInput(element) {
        ['keydown', 'keyup', 'keypress'].forEach(eventType => {
            element.addEventListener(eventType, e => e.stopPropagation());
        });
    }

    /**
     * Show chat history in modal dialog
     * @param {Object} spriteData - The NPC sprite data
     */
    static showChatHistory(spriteData) {
        if (!Array.isArray(spriteData.chatHistory)) spriteData.chatHistory = [];

        const modal = document.createElement('div');
        modal.className = 'ai-npc-modal';

        const title = document.createElement('h3');
        title.textContent = 'Chat History';
        title.className = 'ai-npc-modal-title';
        modal.appendChild(title);

        if (spriteData.chatHistory.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'ai-message';
            empty.textContent = 'No chat history yet.';
            modal.appendChild(empty);
        }

        spriteData.chatHistory.forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.role === 'user' ? 'user-message' : 'ai-message';
            div.textContent = msg.message;
            modal.appendChild(div);
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'ai-npc-close-btn';
        closeBtn.onclick = () => modal.remove();

        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
    }

    /**
     * Test backend API availability
     * @returns {Promise<boolean>} True if API is available
     */
    static async testAPI() {
        try {
            const response = await fetch(pythonURI + '/api/ainpc/test', {
                ...fetchOptions,
                method: 'GET'
            });
            const data = await response.json();
            return data.status === 'ok';
        } catch (err) {
            console.error('AI NPC API test failed:', err);
            return false;
        }
    }

    /**
     * Reset conversation history for a session
     * @param {string} sessionId - Session ID to reset
     */
    static async resetConversation(sessionId) {
        try {
            await fetch(pythonURI + '/api/ainpc/reset', {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify({ session_id: sessionId })
            });
        } catch (err) {
            console.error('Failed to reset conversation:', err);
        }
    }
}

export default AiNpc;
