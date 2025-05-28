class LineMatchingGame {
    constructor() {
        this.englishWords = document.querySelectorAll('#englishWords .word-item');
        this.hebrewWords = document.querySelectorAll('#hebrewWords .word-item');
        this.checkButton = document.getElementById('checkAnswers');
        this.resetButton = document.getElementById('resetGame');
        this.nextLevelButton = document.getElementById('nextLevel');
        this.resultDiv = document.getElementById('result');
        this.svg = document.getElementById('connectionSvg');
        
        // Effect controls
        this.animationsToggle = document.getElementById('animationsEnabled');
        this.soundEffectsToggle = document.getElementById('soundEffectsEnabled');
        this.rippleEffectsToggle = document.getElementById('rippleEffectsEnabled');
        
        this.selectedWord = null;
        this.connections = new Map(); // Store connections: englishWord -> hebrewWord
        this.isLevel2 = false;
        
        // Audio context for sound effects
        this.audioContext = null;
        this.initAudioContext();
        
        // Words from the original game for level 2
        this.originalGameWords = [
            'I', 'you', 'they', 'we', 'ball', 'play', 'soccer', 'goal',
            'before', 'after', 'behind', 'in front of', 'in', 'on', 'under', 'near',
            'open', 'close', 'window', 'table', 'pepper', 'salt', 'food', 'water',
            'write', 'read', 'pay', 'buy'
        ];
        
        // Hebrew translations for the original game words
        this.originalGameTranslations = {
            'I': 'אני',
            'you': 'אתה/את',
            'they': 'הם/הן',
            'we': 'אנחנו',
            'ball': 'כדור',
            'play': 'לשחק',
            'soccer': 'כדורגל',
            'goal': 'שער',
            'before': 'לפני',
            'after': 'אחרי',
            'behind': 'מאחורי',
            'in front of': 'מול',
            'in': 'בתוך',
            'on': 'על',
            'under': 'מתחת',
            'near': 'ליד',
            'open': 'לפתוח',
            'close': 'לסגור',
            'window': 'חלון',
            'table': 'שולחן',
            'pepper': 'פלפל',
            'salt': 'מלח',
            'food': 'אוכל',
            'water': 'מים',
            'write': 'לכתוב',
            'read': 'לקרוא',
            'pay': 'לשלם',
            'buy': 'לקנות'
        };
        
        this.initializeGame();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(frequency, duration = 200, type = 'sine') {
        if (!this.audioContext || !this.soundEffectsToggle.checked) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    initializeGame() {
        // Add event listeners
        this.checkButton.addEventListener('click', () => this.checkAnswers());
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.nextLevelButton.addEventListener('click', () => this.startLevel2());
        
        // Add click functionality to words
        this.addWordClickListeners();
        
        // Initialize result as hidden
        this.resultDiv.className = 'result hidden';
        
        // Shuffle Hebrew words for better gameplay
        this.shuffleHebrewWords();
    }

    addWordClickListeners() {
        this.englishWords.forEach(word => {
            this.addDragListeners(word, 'english');
        });

        this.hebrewWords.forEach(word => {
            this.addDragListeners(word, 'hebrew');
        });
    }

    addDragListeners(wordElement, type) {
        // Mouse down - start dragging
        const startDrag = (e) => {
            e.preventDefault();
            
            // Get coordinates from mouse or touch event
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Initialize drag state
            this.isDragging = true;
            this.startElement = wordElement;
            this.startType = type;
            
            // Play click sound
            this.playSound(400, 100, 'triangle');
            
            // Add ripple effect if enabled
            if (this.rippleEffectsToggle.checked) {
                this.addRippleEffect(wordElement);
            }

            // Clear previous error styling
            this.clearErrorStyling();
            
            // Add dragging class for visual feedback
            wordElement.classList.add('dragging');
            
            // Create temporary drag line
            this.dragLine = this.createDragLine({ clientX, clientY }, wordElement);
            
            // Add global mouse/touch move and up listeners
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
            document.addEventListener('touchmove', this.handleMouseMove);
            document.addEventListener('touchend', this.handleMouseUp);
        };

        wordElement.addEventListener('mousedown', startDrag);
        wordElement.addEventListener('touchstart', startDrag);
    }

    handleMouseMove(e) {
        if (this.isDragging && this.dragLine) {
            // Get coordinates from mouse or touch event
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            this.updateDragLine({ clientX, clientY }, this.dragLine);
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            
            // Get coordinates from mouse or touch event
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            
            // Remove dragging class
            if (this.startElement) {
                this.startElement.classList.remove('dragging');
            }
            
            // Remove drag-hover from all elements
            document.querySelectorAll('.word-item.drag-hover').forEach(el => {
                el.classList.remove('drag-hover');
            });
            
            // Check if we're over a valid target
            const targetElement = document.elementFromPoint(clientX, clientY);
            const targetWord = targetElement?.closest('.word-item');
            
            if (targetWord && targetWord !== this.startElement) {
                const targetType = targetWord.closest('.english-column') ? 'english' : 'hebrew';
                
                // Only create connection if different types
                if (this.startType !== targetType) {
                    const englishElement = this.startType === 'english' ? this.startElement : targetWord;
                    const hebrewElement = this.startType === 'hebrew' ? this.startElement : targetWord;
                    
                    // Play connection sound
                    this.playSound(600, 300, 'sine');
                    
                    // Create the connection
                    this.createConnection(englishElement, hebrewElement);
                }
            }
            
            // Clean up drag line
            if (this.dragLine) {
                this.dragLine.remove();
                this.dragLine = null;
            }
            
            // Remove global listeners
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            document.removeEventListener('touchmove', this.handleMouseMove);
            document.removeEventListener('touchend', this.handleMouseUp);
            
            this.startElement = null;
            this.startType = null;
        }
    }

    createDragLine(event, startElement) {
        const startRect = startElement.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();
        
        // Calculate start point
        const startX = startElement.closest('.english-column') 
            ? startRect.right - svgRect.left 
            : startRect.left - svgRect.left;
        const startY = startRect.top + startRect.height / 2 - svgRect.top;
        
        // Create temporary line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', startX);
        line.setAttribute('y2', startY);
        line.setAttribute('class', 'connection-line drag-line');
        line.setAttribute('id', 'temp-drag-line');
        
        this.svg.appendChild(line);
        return line;
    }

    updateDragLine(event, dragLine) {
        if (!dragLine) return;
        
        const svgRect = this.svg.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;
        
        dragLine.setAttribute('x2', mouseX);
        dragLine.setAttribute('y2', mouseY);
        
        // Add visual feedback if hovering over a valid target
        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const targetWord = targetElement?.closest('.word-item');
        
        // Remove previous hover effects
        document.querySelectorAll('.word-item.drag-hover').forEach(el => {
            el.classList.remove('drag-hover');
        });
        
        if (targetWord && !targetWord.classList.contains('dragging')) {
            targetWord.classList.add('drag-hover');
        }
    }

    shuffleHebrewWords() {
        const hebrewContainer = document.getElementById('hebrewWords');
        const hebrewArray = Array.from(this.hebrewWords);
        
        // Shuffle array
        for (let i = hebrewArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [hebrewArray[i], hebrewArray[j]] = [hebrewArray[j], hebrewArray[i]];
        }
        
        // Re-append in shuffled order
        hebrewArray.forEach(word => hebrewContainer.appendChild(word));
    }

    addRippleEffect(element) {
        // Add ripple class
        element.classList.add('ripple');
        
        // Remove ripple class after animation
        setTimeout(() => {
            element.classList.remove('ripple');
        }, 600);
    }

    createConnection(englishElement, hebrewElement) {
        const englishWord = englishElement.dataset.word;
        const hebrewWord = hebrewElement.dataset.word;
        
        // Remove existing connection if any
        this.removeConnectionForWord(englishWord);
        
        // Store new connection
        this.connections.set(englishWord, hebrewWord);
        
        // Draw line
        this.drawLine(englishElement, hebrewElement, englishWord);
        
        // Mark words as connected
        englishElement.classList.add('matched');
        hebrewElement.classList.add('matched');
        
        // Clear result when making connections
        this.clearResult();
    }

    removeConnectionForWord(englishWord) {
        if (this.connections.has(englishWord)) {
            // Get existing line and clean up effects
            const existingLine = document.getElementById(`line-${englishWord}`);
            if (existingLine) {
                this.cleanupLineEffects(existingLine);
                existingLine.remove();
            }
            
            // Remove matched styling from words
            this.englishWords.forEach(word => {
                if (word.dataset.word === englishWord) {
                    word.classList.remove('matched');
                    word.style.transform = ''; // Reset any transform effects
                }
            });
            
            const oldHebrewWord = this.connections.get(englishWord);
            this.hebrewWords.forEach(word => {
                if (word.dataset.word === oldHebrewWord) {
                    word.classList.remove('matched');
                    word.style.transform = ''; // Reset any transform effects
                }
            });
            
            this.connections.delete(englishWord);
        }
    }

    drawLine(englishElement, hebrewElement, englishWord) {
        const englishRect = englishElement.getBoundingClientRect();
        const hebrewRect = hebrewElement.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();
        
        // Calculate connection points
        const x1 = englishRect.right - svgRect.left;
        const y1 = englishRect.top + englishRect.height / 2 - svgRect.top;
        const x2 = hebrewRect.left - svgRect.left;
        const y2 = hebrewRect.top + hebrewRect.height / 2 - svgRect.top;
        
        // Remove existing line if any
        const existingLine = document.getElementById(`line-${englishWord}`);
        if (existingLine) {
            existingLine.remove();
        }
        
        // Create new line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        
        // Apply classes based on animation settings
        let lineClasses = 'connection-line temp';
        if (this.animationsToggle.checked) {
            lineClasses += ' drawing';
        }
        line.setAttribute('class', lineClasses);
        line.setAttribute('id', `line-${englishWord}`);
        
        // Add line stretching effects
        this.addLineStretchingEffects(line, englishElement, hebrewElement);
        
        this.svg.appendChild(line);
        
        // Apply animations only if enabled
        if (this.animationsToggle.checked) {
            // Remove drawing animation after it completes
            setTimeout(() => {
                line.classList.remove('drawing');
                line.classList.add('elastic');
                
                // Remove elastic animation after it completes
                setTimeout(() => {
                    line.classList.remove('elastic');
                }, 600);
            }, 800);
        }
    }

    addLineStretchingEffects(line, englishElement, hebrewElement) {
        // Add hover effects to connected words
        const addHoverEffect = () => {
            line.classList.add('active');
            englishElement.style.transform = 'scale(1.1)';
            hebrewElement.style.transform = 'scale(1.1)';
        };
        
        const removeHoverEffect = () => {
            line.classList.remove('active');
            englishElement.style.transform = '';
            hebrewElement.style.transform = '';
        };
        
        // Add event listeners for interactive effects
        englishElement.addEventListener('mouseenter', addHoverEffect);
        englishElement.addEventListener('mouseleave', removeHoverEffect);
        hebrewElement.addEventListener('mouseenter', addHoverEffect);
        hebrewElement.addEventListener('mouseleave', removeHoverEffect);
        
        // Store references for cleanup
        line._hoverEffects = {
            addHoverEffect,
            removeHoverEffect,
            englishElement,
            hebrewElement
        };
        
        // Add line click effect for fun interaction
        line.addEventListener('click', () => {
            if (!line.classList.contains('bouncy')) {
                line.classList.add('bouncy');
                setTimeout(() => {
                    line.classList.remove('bouncy');
                }, 800);
            }
        });
        
        // Add double-click to add wave effect
        line.addEventListener('dblclick', () => {
            if (!line.classList.contains('wave')) {
                line.classList.add('wave');
                setTimeout(() => {
                    line.classList.remove('wave');
                }, 3000);
            }
        });
    }

    cleanupLineEffects(line) {
        if (line && line._hoverEffects) {
            const { addHoverEffect, removeHoverEffect, englishElement, hebrewElement } = line._hoverEffects;
            
            // Remove event listeners
            englishElement.removeEventListener('mouseenter', addHoverEffect);
            englishElement.removeEventListener('mouseleave', removeHoverEffect);
            hebrewElement.removeEventListener('mouseenter', addHoverEffect);
            hebrewElement.removeEventListener('mouseleave', removeHoverEffect);
            
            // Reset transforms
            englishElement.style.transform = '';
            hebrewElement.style.transform = '';
        }
    }

    checkAnswers() {
        if (this.connections.size < 8) {
            this.showResult('Please connect all word pairs before checking!', 'error');
            return;
        }

        let correctCount = 0;
        const incorrectWords = [];

        // Clear all previous line styling
        document.querySelectorAll('.connection-line').forEach(line => {
            line.classList.remove('correct', 'incorrect');
            line.classList.add('temp');
        });

        // Check each connection
        this.connections.forEach((hebrewWord, englishWord) => {
            const line = document.getElementById(`line-${englishWord}`);
            const englishElement = Array.from(this.englishWords).find(w => w.dataset.word === englishWord);
            const hebrewElement = Array.from(this.hebrewWords).find(w => w.dataset.word === hebrewWord);
            
            if (englishWord === hebrewWord) {
                // Correct match
                correctCount++;
                if (line) {
                    line.classList.remove('temp');
                    line.classList.add('correct');
                }
            } else {
                // Incorrect match
                incorrectWords.push(englishWord);
                if (line) {
                    line.classList.remove('temp');
                    line.classList.add('incorrect');
                }
                if (englishElement) englishElement.classList.add('incorrect');
                if (hebrewElement) hebrewElement.classList.add('incorrect');
            }
        });

        // Show result
        if (correctCount === 8) {
            // Play success sound
            this.playSuccessSound();
            this.showResult('Perfect! All matches are correct! 🎉', 'success');
            if (!this.isLevel2) {
                this.nextLevelButton.classList.remove('hidden');
            }
        } else {
            // Play error sound
            this.playErrorSound();
            this.showResult(`${correctCount}/8 correct. Try again!`, 'error');
        }
    }

    playSuccessSound() {
        if (!this.audioContext || !this.soundEffectsToggle.checked) return;
        
        // Play a cheerful ascending melody
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 300, 'sine');
            }, index * 150);
        });
    }

    playErrorSound() {
        if (!this.audioContext || !this.soundEffectsToggle.checked) return;
        
        // Play a descending error sound
        const notes = [400, 350, 300]; // Descending tones
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 200, 'sawtooth');
            }, index * 100);
        });
    }

    clearErrorStyling() {
        this.englishWords.forEach(word => word.classList.remove('incorrect'));
        this.hebrewWords.forEach(word => word.classList.remove('incorrect'));
    }

    showResult(message, type) {
        this.resultDiv.textContent = message;
        this.resultDiv.className = `result ${type}`;
        this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearResult() {
        this.resultDiv.className = 'result hidden';
    }

    resetGame() {
        // Clean up all line effects before clearing connections
        document.querySelectorAll('.connection-line').forEach(line => {
            this.cleanupLineEffects(line);
        });
        
        // Clear all connections
        this.connections.clear();
        
        // Remove all lines
        this.svg.innerHTML = '';
        
        // Reset word styling and transforms
        this.englishWords.forEach(word => {
            word.classList.remove('selected', 'matched', 'incorrect');
            word.style.transform = ''; // Reset any transform effects
        });
        this.hebrewWords.forEach(word => {
            word.classList.remove('selected', 'matched', 'incorrect');
            word.style.transform = ''; // Reset any transform effects
        });
        
        // Clear selection
        this.selectedWord = null;
        
        // Hide result and next level button
        this.clearResult();
        this.nextLevelButton.classList.add('hidden');
        
        // Shuffle Hebrew words again
        this.shuffleHebrewWords();
    }

    startLevel2() {
        // Get 8 random words from the original game
        const shuffledWords = [...this.originalGameWords].sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, 8);
        
        // Update the game with new words
        this.updateGameWords(selectedWords);
        
        // Reset game state
        this.resetGame();
        this.isLevel2 = true;
        
        // Update header
        const header = document.querySelector('header h1');
        header.textContent = '🎯 Level 2: Advanced Vocabulary';
        
        const headerP = document.querySelector('header p');
        headerP.textContent = 'Match these words from the completion game!';
        
        // Hide next level button
        this.nextLevelButton.classList.add('hidden');
    }

    updateGameWords(words) {
        const englishContainer = document.getElementById('englishWords');
        const hebrewContainer = document.getElementById('hebrewWords');
        
        // Clear existing words
        englishContainer.innerHTML = '';
        hebrewContainer.innerHTML = '';
        
        // Create Hebrew translations
        const hebrewTranslations = words.map(word => this.originalGameTranslations[word]);
        
        // Add new English words
        words.forEach(word => {
            const div = document.createElement('div');
            div.className = 'word-item';
            div.dataset.word = word;
            div.textContent = word;
            englishContainer.appendChild(div);
        });
        
        // Add new Hebrew words (shuffled)
        const shuffledHebrew = [...hebrewTranslations].sort(() => Math.random() - 0.5);
        shuffledHebrew.forEach((translation, index) => {
            const div = document.createElement('div');
            div.className = 'word-item';
            // Find the corresponding English word for this translation
            const englishWord = words[hebrewTranslations.indexOf(translation)];
            div.dataset.word = englishWord;
            div.textContent = translation;
            hebrewContainer.appendChild(div);
        });
        
        // Update references
        this.englishWords = document.querySelectorAll('#englishWords .word-item');
        this.hebrewWords = document.querySelectorAll('#hebrewWords .word-item');
        
        // Re-add event listeners
        this.addWordClickListeners();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new LineMatchingGame();
    // Store reference for keyboard shortcuts
    document.querySelector('.container')._gameInstance = game;
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to cancel current drag operation
    if (e.key === 'Escape') {
        const gameInstance = document.querySelector('.container')?._gameInstance;
        if (gameInstance && gameInstance.isDragging) {
            // Cancel current drag
            if (gameInstance.dragLine) {
                gameInstance.dragLine.remove();
                gameInstance.dragLine = null;
            }
            if (gameInstance.startElement) {
                gameInstance.startElement.classList.remove('dragging');
            }
            // Clean up drag hover effects
            document.querySelectorAll('.word-item.drag-hover').forEach(el => {
                el.classList.remove('drag-hover');
            });
            
            gameInstance.isDragging = false;
            gameInstance.startElement = null;
            gameInstance.startType = null;
            
            // Remove global listeners
            document.removeEventListener('mousemove', gameInstance.handleMouseMove);
            document.removeEventListener('mouseup', gameInstance.handleMouseUp);
        }
    }
    
    // Ctrl/Cmd + Enter to check answers
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('checkAnswers').click();
    }
    
    // Ctrl/Cmd + R to reset (prevent default browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        document.getElementById('resetGame').click();
    }
}); 