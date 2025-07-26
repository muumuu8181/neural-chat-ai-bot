// NEURAL CHAT - AI Chatbot Engine

class NeuralChat {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupEventListeners();
        this.initializeBackgroundEffects();
        this.initializeAudio();
        this.loadSettings();
        
        // 初期化完了通知
        this.showNotification('Neural Chat が準備完了しました！', 'success');
    }
    
    initializeElements() {
        // DOM要素の参照を取得
        this.elements = {
            // チャット関連
            messagesContainer: document.getElementById('messagesContainer'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            charCount: document.getElementById('charCount'),
            suggestions: document.getElementById('suggestions'),
            
            // ヘッダーコントロール
            themeToggle: document.getElementById('themeToggle'),
            settingsBtn: document.getElementById('settingsBtn'),
            clearBtn: document.getElementById('clearBtn'),
            
            // サイドパネル
            sidePanel: document.getElementById('sidePanel'),
            closePanelBtn: document.getElementById('closePanelBtn'),
            chatSessions: document.getElementById('chatSessions'),
            newChatBtn: document.getElementById('newChatBtn'),
            
            // モーダル
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            voiceModal: document.getElementById('voiceModal'),
            closeVoiceBtn: document.getElementById('closeVoiceBtn'),
            
            // アクションボタン
            attachBtn: document.getElementById('attachBtn'),
            voiceBtn: document.getElementById('voiceBtn'),
            
            // 音声関連
            startVoiceBtn: document.getElementById('startVoiceBtn'),
            stopVoiceBtn: document.getElementById('stopVoiceBtn'),
            voiceStatus: document.getElementById('voiceStatus'),
            voiceTranscript: document.getElementById('voiceTranscript'),
            
            // 設定
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            
            // その他
            loadingIndicator: document.getElementById('loadingIndicator'),
            notificationContainer: document.getElementById('notificationContainer'),
            
            // キャンバス
            neuralCanvas: document.getElementById('neuralCanvas'),
            particlesCanvas: document.getElementById('particlesCanvas')
        };
    }
    
    initializeState() {
        // アプリケーション状態
        this.state = {
            currentSessionId: this.generateSessionId(),
            isThinking: false,
            isDarkTheme: true,
            settings: {
                personality: 'helpful',
                responseLength: 'medium',
                responseSpeed: 3,
                showTyping: true,
                showTimestamps: true,
                soundEffects: true,
                language: 'ja'
            },
            chatHistory: [],
            sessions: new Map(),
            isRecording: false,
            recognition: null
        };
        
        // チャットセッションの初期化
        this.initializeSession();
        
        // AI応答データベース
        this.aiResponses = this.initializeAIResponses();
        
        // タイピング状態
        this.typingTimer = null;
        
        // 音声認識の初期化
        this.initializeSpeechRecognition();
    }
    
    initializeSession() {
        const session = {
            id: this.state.currentSessionId,
            title: '新しいチャット',
            messages: [],
            createdAt: new Date(),
            lastActivity: new Date()
        };
        
        this.state.sessions.set(this.state.currentSessionId, session);
        this.updateSessionsList();
    }
    
    initializeAIResponses() {
        return {
            greetings: [
                'こんにちは！今日はどのようなことでお手伝いできますか？',
                'お疲れ様です！何かご質問はありますか？',
                'こんにちは！お気軽に何でもお聞きください。',
                'いらっしゃいませ！どんなお話をしましょうか？'
            ],
            
            helpRequests: [
                'もちろんです！どのような分野でお手伝いが必要ですか？具体的にお聞かせください。',
                'お手伝いできることがたくさんあります。プログラミング、文章作成、アイデア出し、問題解決など、どんなことでもお気軽にどうぞ！',
                'サポートいたします！詳細を教えていただければ、最適な回答を提供できます。'
            ],
            
            programming: [
                'プログラミングの質問ですね！どの言語や技術についてお聞きしたいですか？',
                'コードの問題解決は得意分野です。エラーメッセージや実現したい機能について詳しく教えてください。',
                'プログラミングでお困りですか？具体的なコードや問題の詳細をお聞かせください。'
            ],
            
            creative: [
                '創作活動のお手伝いですね！アイデア出しは大好きです。どんなジャンルやテーマをお考えですか？',
                'クリエイティブな作業のサポートをさせていただきます！具体的にどのような作品を作られるのでしょうか？',
                '創造性を発揮するお手伝いをいたします。どんなインスピレーションが必要ですか？'
            ],
            
            questions: [
                '興味深い質問ですね！詳しく説明させていただきます。',
                '良い質問です！私の知識の範囲でお答えいたします。',
                'お答えいたします。もし追加の詳細が必要でしたら、お気軽にお聞きください。'
            ],
            
            unknown: [
                '申し訳ございませんが、その内容については詳しい情報を持っておりません。別の角度からお聞かせいただけますか？',
                'その件について、もう少し詳細を教えていただけますでしょうか？より具体的にお答えできるかもしれません。',
                '興味深いトピックですね！私なりの見解をお話しできますが、専門的な内容でしたら他の情報源もご参照いただければと思います。'
            ]
        };
    }
    
    setupEventListeners() {
        // メッセージ送信
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 文字数カウント
        this.elements.messageInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.autoResizeTextarea();
        });
        
        // 提案ボタン
        this.elements.suggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                this.elements.messageInput.value = e.target.textContent;
                this.updateCharacterCount();
                this.elements.messageInput.focus();
            }
        });
        
        // ヘッダーコントロール
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.clearBtn.addEventListener('click', () => this.clearChat());
        
        // サイドパネル
        this.elements.closePanelBtn.addEventListener('click', () => this.closeSidePanel());
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
        
        // モーダル
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.closeVoiceBtn.addEventListener('click', () => this.closeVoiceModal());
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        
        // アクションボタン
        this.elements.attachBtn.addEventListener('click', () => this.handleFileAttach());
        this.elements.voiceBtn.addEventListener('click', () => this.openVoiceModal());
        
        // 音声認識
        this.elements.startVoiceBtn.addEventListener('click', () => this.startVoiceRecording());
        this.elements.stopVoiceBtn.addEventListener('click', () => this.stopVoiceRecording());
        
        // モーダル背景クリック
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
        
        this.elements.voiceModal.addEventListener('click', (e) => {
            if (e.target === this.elements.voiceModal) {
                this.closeVoiceModal();
            }
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => this.handleResize());
    }
    
    initializeBackgroundEffects() {
        this.setupNeuralNetworkAnimation();
        this.setupParticleSystem();
    }
    
    setupNeuralNetworkAnimation() {
        const canvas = this.elements.neuralCanvas;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // ニューラルネットワークのノードと接続
        const nodes = [];
        const connections = [];
        
        // ノードの生成
        for (let i = 0; i < 50; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                activity: Math.random()
            });
        }
        
        const animateNetwork = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // ノードの更新と描画
            nodes.forEach(node => {
                // 位置更新
                node.x += node.vx;
                node.y += node.vy;
                
                // 境界でバウンス
                if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
                if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;
                
                // アクティビティ更新
                node.activity += (Math.random() - 0.5) * 0.02;
                node.activity = Math.max(0, Math.min(1, node.activity));
                
                // ノード描画
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + node.activity * 0.7})`;
                ctx.fill();
                
                // グロー効果
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#6366f1';
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // 接続線の描画
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    const distance = Math.sqrt(
                        Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
                    );
                    
                    if (distance < 150) {
                        const opacity = (150 - distance) / 150 * 0.3;
                        const activity = (node1.activity + node2.activity) / 2;
                        
                        ctx.beginPath();
                        ctx.moveTo(node1.x, node1.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * activity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animateNetwork);
        };
        
        animateNetwork();
    }
    
    setupParticleSystem() {
        const canvas = this.elements.particlesCanvas;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const particles = [];
        
        // パーティクル生成
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // 位置更新
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.pulse += 0.02;
                
                // 境界を超えたら反対側に出現
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // パーティクル描画
                const pulseOpacity = particle.opacity * (0.5 + 0.5 * Math.sin(particle.pulse));
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${pulseOpacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    initializeAudio() {
        this.audioContext = null;
        this.sounds = {};
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;
        } catch (e) {
            console.warn('Audio context not available');
        }
    }
    
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.recognition = new SpeechRecognition();
            
            this.state.recognition.continuous = false;
            this.state.recognition.interimResults = true;
            this.state.recognition.lang = this.state.settings.language;
            
            this.state.recognition.onstart = () => {
                this.state.isRecording = true;
                this.elements.voiceStatus.textContent = '聞いています...';
                this.elements.startVoiceBtn.disabled = true;
                this.elements.stopVoiceBtn.disabled = false;
            };
            
            this.state.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.elements.voiceTranscript.textContent = transcript;
            };
            
            this.state.recognition.onend = () => {
                this.state.isRecording = false;
                this.elements.voiceStatus.textContent = '録音が完了しました';
                this.elements.startVoiceBtn.disabled = false;
                this.elements.stopVoiceBtn.disabled = true;
                
                if (this.elements.voiceTranscript.textContent.trim()) {
                    this.elements.messageInput.value = this.elements.voiceTranscript.textContent;
                    this.updateCharacterCount();
                    this.closeVoiceModal();
                }
            };
            
            this.state.recognition.onerror = (event) => {
                this.showNotification('音声認識でエラーが発生しました: ' + event.error, 'error');
                this.state.isRecording = false;
                this.elements.startVoiceBtn.disabled = false;
                this.elements.stopVoiceBtn.disabled = true;
            };
        }
    }
    
    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.state.isThinking) return;
        
        // ユーザーメッセージを追加
        this.addMessage('user', message);
        
        // 入力フィールドをクリア
        this.elements.messageInput.value = '';
        this.updateCharacterCount();
        this.autoResizeTextarea();
        
        // AIの応答を生成
        this.generateAIResponse(message);
        
        // 効果音
        this.playSound('send');
    }
    
    addMessage(sender, content, options = {}) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        if (options.typing) {
            messageElement.classList.add('typing-message');
        }
        
        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        
        if (sender === 'ai') {
            avatarElement.innerHTML = '<div class="ai-icon">🧠</div>';
        } else {
            avatarElement.innerHTML = '<div class="user-icon">👤</div>';
        }
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        
        if (options.typing) {
            textElement.innerHTML = this.createTypingIndicator();
        } else {
            textElement.textContent = content;
        }
        
        contentElement.appendChild(textElement);
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        
        this.elements.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // チャット履歴に追加
        const messageData = {
            id: this.generateMessageId(),
            sender,
            content,
            timestamp: new Date(),
            ...options
        };
        
        const currentSession = this.state.sessions.get(this.state.currentSessionId);
        currentSession.messages.push(messageData);
        currentSession.lastActivity = new Date();
        
        return messageElement;
    }
    
    generateAIResponse(userMessage) {
        this.state.isThinking = true;
        this.elements.loadingIndicator.classList.add('active');
        
        // タイピングインジケーターを表示
        let typingElement = null;
        if (this.state.settings.showTyping) {
            typingElement = this.addMessage('ai', '', { typing: true });
        }
        
        // レスポンス速度に基づく遅延
        const delay = (6 - this.state.settings.responseSpeed) * 500 + 500;
        
        setTimeout(() => {
            // タイピングインジケーターを削除
            if (typingElement) {
                typingElement.remove();
            }
            
            // AI応答を生成
            const response = this.analyzeAndRespond(userMessage);
            
            // AIメッセージを追加
            const aiMessageElement = this.addMessage('ai', response);
            
            // タイピングアニメーション
            if (this.state.settings.showTyping) {
                this.animateTyping(aiMessageElement.querySelector('.message-text'), response);
            }
            
            this.state.isThinking = false;
            this.elements.loadingIndicator.classList.remove('active');
            
            // 効果音
            this.playSound('receive');
            
        }, delay);
    }
    
    analyzeAndRespond(userMessage) {
        const message = userMessage.toLowerCase();
        
        // キーワード分析
        if (this.containsKeywords(message, ['こんにちは', 'こんばんは', 'おはよう', 'はじめまして'])) {
            return this.getRandomResponse('greetings');
        }
        
        if (this.containsKeywords(message, ['手伝', 'ヘルプ', '助け', 'サポート'])) {
            return this.getRandomResponse('helpRequests');
        }
        
        if (this.containsKeywords(message, ['プログラム', 'コード', 'javascript', 'python', 'html', 'css'])) {
            return this.getRandomResponse('programming');
        }
        
        if (this.containsKeywords(message, ['創作', 'アイデア', '小説', '作品', 'デザイン'])) {
            return this.getRandomResponse('creative');
        }
        
        if (message.includes('?') || message.includes('？') || this.containsKeywords(message, ['教え', '説明', 'どう'])) {
            return this.getRandomResponse('questions') + this.generateContextualResponse(userMessage);
        }
        
        return this.getRandomResponse('unknown');
    }
    
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    getRandomResponse(category) {
        const responses = this.aiResponses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateContextualResponse(userMessage) {
        // パーソナリティに基づく応答の調整
        const personality = this.state.settings.personality;
        const length = this.state.settings.responseLength;
        
        let additionalContent = '';
        
        if (personality === 'creative') {
            additionalContent += '\n\n創造的な視点から考えてみると、';
        } else if (personality === 'technical') {
            additionalContent += '\n\n技術的な観点から詳しく説明すると、';
        } else if (personality === 'casual') {
            additionalContent += '\n\nざっくり言うと、';
        }
        
        if (length === 'long') {
            additionalContent += 'より詳細な情報や具体例をお求めでしたら、どのような点について深く知りたいかお聞かせください。';
        } else if (length === 'short') {
            additionalContent += '簡潔にお答えいたします。';
        }
        
        return additionalContent;
    }
    
    createTypingIndicator() {
        return `
            <div class="typing-indicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>入力中...</span>
            </div>
        `;
    }
    
    animateTyping(element, text) {
        element.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 30);
            }
        };
        
        typeWriter();
    }
    
    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
    
    updateCharacterCount() {
        const count = this.elements.messageInput.value.length;
        this.elements.charCount.textContent = count;
        
        // 送信ボタンの状態を更新
        this.elements.sendBtn.disabled = count === 0 || count > 2000;
        
        // 文字数警告
        if (count > 1800) {
            this.elements.charCount.style.color = 'var(--warning)';
        } else if (count > 2000) {
            this.elements.charCount.style.color = 'var(--error)';
        } else {
            this.elements.charCount.style.color = 'var(--text-muted)';
        }
    }
    
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    toggleTheme() {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        
        if (this.state.isDarkTheme) {
            document.body.removeAttribute('data-theme');
            this.elements.themeToggle.querySelector('.icon').textContent = '🌙';
        } else {
            document.body.setAttribute('data-theme', 'light');
            this.elements.themeToggle.querySelector('.icon').textContent = '☀️';
        }
        
        this.saveSettings();
        this.showNotification(`${this.state.isDarkTheme ? 'ダーク' : 'ライト'}テーマに切り替えました`, 'success');
    }
    
    openSettings() {
        this.elements.settingsModal.classList.add('active');
        this.loadSettingsUI();
    }
    
    closeSettings() {
        this.elements.settingsModal.classList.remove('active');
    }
    
    openVoiceModal() {
        if (!this.state.recognition) {
            this.showNotification('音声認識がサポートされていません', 'error');
            return;
        }
        
        this.elements.voiceModal.classList.add('active');
        this.elements.voiceStatus.textContent = 'マイクボタンを押して話してください';
        this.elements.voiceTranscript.textContent = '';
    }
    
    closeVoiceModal() {
        this.elements.voiceModal.classList.remove('active');
        if (this.state.isRecording) {
            this.stopVoiceRecording();
        }
    }
    
    startVoiceRecording() {
        if (this.state.recognition && !this.state.isRecording) {
            this.state.recognition.start();
        }
    }
    
    stopVoiceRecording() {
        if (this.state.recognition && this.state.isRecording) {
            this.state.recognition.stop();
        }
    }
    
    clearChat() {
        if (confirm('チャット履歴を削除しますか？')) {
            this.elements.messagesContainer.innerHTML = '';
            const currentSession = this.state.sessions.get(this.state.currentSessionId);
            currentSession.messages = [];
            
            // ウェルカムメッセージを再表示
            this.addWelcomeMessage();
            this.showNotification('チャット履歴を削除しました', 'success');
        }
    }
    
    addWelcomeMessage() {
        const welcomeHTML = `
            <h3>Neural Chatへようこそ！</h3>
            <p>私は最新のAI技術を搭載したチャットボットです。どんなことでもお気軽にお聞きください。</p>
            <div class="welcome-features">
                <div class="feature-item">
                    <span class="feature-icon">💡</span>
                    <span>創造的な提案</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📚</span>
                    <span>豊富な知識</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🔄</span>
                    <span>文脈理解</span>
                </div>
            </div>
        `;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message welcome-message';
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                <div class="ai-icon">🧠</div>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${welcomeHTML}
                </div>
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(messageElement);
    }
    
    createNewChat() {
        this.state.currentSessionId = this.generateSessionId();
        this.initializeSession();
        this.clearChat();
        this.closeSidePanel();
        this.showNotification('新しいチャットを開始しました', 'success');
    }
    
    closeSidePanel() {
        this.elements.sidePanel.classList.remove('active');
    }
    
    updateSessionsList() {
        const container = this.elements.chatSessions;
        container.innerHTML = '';
        
        const sessions = Array.from(this.state.sessions.values())
            .sort((a, b) => b.lastActivity - a.lastActivity);
        
        sessions.forEach(session => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            
            if (session.id === this.state.currentSessionId) {
                sessionElement.classList.add('active');
            }
            
            const timeText = this.formatTime(session.lastActivity);
            const preview = session.messages.length > 0 
                ? session.messages[session.messages.length - 1].content.substring(0, 50) + '...'
                : 'Neural Chatへようこそ！';
            
            sessionElement.innerHTML = `
                <div class="session-info">
                    <div class="session-title">${session.title}</div>
                    <div class="session-time">${timeText}</div>
                </div>
                <div class="session-preview">${preview}</div>
            `;
            
            sessionElement.addEventListener('click', () => {
                this.switchToSession(session.id);
            });
            
            container.appendChild(sessionElement);
        });
    }
    
    switchToSession(sessionId) {
        if (sessionId === this.state.currentSessionId) return;
        
        this.state.currentSessionId = sessionId;
        this.loadSessionMessages();
        this.updateSessionsList();
        this.closeSidePanel();
    }
    
    loadSessionMessages() {
        const session = this.state.sessions.get(this.state.currentSessionId);
        this.elements.messagesContainer.innerHTML = '';
        
        if (session.messages.length === 0) {
            this.addWelcomeMessage();
        } else {
            session.messages.forEach(message => {
                this.addMessage(message.sender, message.content);
            });
        }
    }
    
    loadSettingsUI() {
        // パーソナリティ設定
        const personalityRadios = document.querySelectorAll('input[name="personality"]');
        personalityRadios.forEach(radio => {
            radio.checked = radio.value === this.state.settings.personality;
        });
        
        // その他の設定
        document.getElementById('responseLength').value = this.state.settings.responseLength;
        document.getElementById('responseSpeed').value = this.state.settings.responseSpeed;
        document.getElementById('showTyping').checked = this.state.settings.showTyping;
        document.getElementById('showTimestamps').checked = this.state.settings.showTimestamps;
        document.getElementById('soundEffects').checked = this.state.settings.soundEffects;
        document.getElementById('language').value = this.state.settings.language;
    }
    
    saveSettings() {
        // パーソナリティ
        const selectedPersonality = document.querySelector('input[name="personality"]:checked');
        if (selectedPersonality) {
            this.state.settings.personality = selectedPersonality.value;
        }
        
        // その他の設定
        this.state.settings.responseLength = document.getElementById('responseLength')?.value || this.state.settings.responseLength;
        this.state.settings.responseSpeed = parseInt(document.getElementById('responseSpeed')?.value) || this.state.settings.responseSpeed;
        this.state.settings.showTyping = document.getElementById('showTyping')?.checked ?? this.state.settings.showTyping;
        this.state.settings.showTimestamps = document.getElementById('showTimestamps')?.checked ?? this.state.settings.showTimestamps;
        this.state.settings.soundEffects = document.getElementById('soundEffects')?.checked ?? this.state.settings.soundEffects;
        this.state.settings.language = document.getElementById('language')?.value || this.state.settings.language;
        
        // テーマ設定も保存
        this.state.settings.isDarkTheme = this.state.isDarkTheme;
        
        // ローカルストレージに保存
        localStorage.setItem('neuralChatSettings', JSON.stringify(this.state.settings));
        
        // 音声認識の言語を更新
        if (this.state.recognition) {
            this.state.recognition.lang = this.state.settings.language;
        }
        
        this.closeSettings();
        this.showNotification('設定を保存しました', 'success');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('neuralChatSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.state.settings = { ...this.state.settings, ...settings };
                
                // テーマを適用
                if (settings.isDarkTheme !== undefined) {
                    this.state.isDarkTheme = settings.isDarkTheme;
                    if (!this.state.isDarkTheme) {
                        document.body.setAttribute('data-theme', 'light');
                        this.elements.themeToggle.querySelector('.icon').textContent = '☀️';
                    }
                }
            } catch (e) {
                console.warn('設定の読み込みに失敗しました');
            }
        }
    }
    
    resetSettings() {
        if (confirm('設定をリセットしますか？')) {
            localStorage.removeItem('neuralChatSettings');
            location.reload();
        }
    }
    
    handleFileAttach() {
        this.showNotification('ファイル添付機能は準備中です', 'warning');
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter で送信
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        }
        
        // Esc でモーダルを閉じる
        if (e.key === 'Escape') {
            this.closeSettings();
            this.closeVoiceModal();
            this.closeSidePanel();
        }
        
        // Ctrl/Cmd + N で新しいチャット
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.createNewChat();
        }
    }
    
    handleResize() {
        // キャンバスサイズの調整は背景アニメーションで自動処理される
        this.scrollToBottom();
    }
    
    playSound(type) {
        if (!this.state.settings.soundEffects || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            const frequencies = {
                send: 800,
                receive: 600,
                notification: 400
            };
            
            oscillator.frequency.value = frequencies[type] || 500;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (e) {
            // 音声エラーは無視
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // 3秒後に自動削除
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // 効果音
        this.playSound('notification');
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '今';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '時間前';
        return Math.floor(diff / 86400000) + '日前';
    }
}

// CSS keyframes for notification slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideOut {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const neuralChat = new NeuralChat();
    
    // デバッグ用
    window.neuralChat = neuralChat;
});