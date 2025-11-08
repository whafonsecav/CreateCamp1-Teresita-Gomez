document.addEventListener("DOMContentLoaded", () => {
    // --- Selección de Elementos (NAV) ---
    const slideDeck = document.querySelector(".slide-deck");
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const dotsContainer = document.getElementById("dots-container");

    // --- Selección de elementos de audio ---
    const audio = document.getElementById("bg-audio");
    const muteBtn = document.getElementById("mute-btn");
    const muteIcon = muteBtn.querySelector("i");
    const songTitle = document.getElementById("song-title");

    // --- Selección de elementos del MODAL (Pop-up) ---
    const modal = document.getElementById("answer-modal");
    const closeModalBtn = document.querySelector(".close-modal-btn");
    const gameAnswerText = document.getElementById("game-answer-text");
    const playAgainBtn = document.getElementById("play-again-btn");

    let currentSlide = 0;
    const totalSlides = slides.length; // Esto ahora será 17
    let dots = [];
    let isSpinning = false; // Previene múltiples giros
    let currentGameContext = null; // Guarda el juego activo para el modal

    // --- Variables para Táctil (Swipe) ---
    let touchstartX = 0;
    let touchendX = 0;

    // --- LÓGICA DE NAVEGACIÓN ---

    function showSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");

        currentSlide = index;
        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");

        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = (currentSlide === 0);
        nextBtn.disabled = (currentSlide === totalSlides - 1);
    }

    function goToNextSlide() {
        if (currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        }
    }

    function goToPrevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }

    function createIndicatorDots() {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dot.setAttribute("data-slide", i);
            dot.addEventListener("click", () => showSlide(i));
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchendX < touchstartX - swipeThreshold) goToNextSlide();
        if (touchendX > touchstartX + swipeThreshold) goToPrevSlide();
    }

    slideDeck.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, { passive: true });
    slideDeck.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });

    // --- LÓGICA DE AUDIO ---

    function playAudioOnFirstInteraction() {
        audio.volume = 0.2;
        audio.play().catch(e => console.error("Error de audio:", e));
        songTitle.classList.add("visible");
        document.body.removeEventListener('click', playAudioOnFirstInteraction);
        document.body.removeEventListener('keydown', playAudioOnFirstInteraction);
    }
    
    document.body.addEventListener('click', playAudioOnFirstInteraction);
    document.body.addEventListener('keydown', playAudioOnFirstInteraction);

    muteBtn.addEventListener("click", () => {
        if (audio.muted) {
            audio.muted = false;
            muteIcon.classList.remove("fa-volume-xmark");
            muteIcon.classList.add("fa-volume-high");
            muteBtn.title = "Silenciar (M)";
            songTitle.classList.add("visible");
        } else {
            audio.muted = true;
            muteIcon.classList.remove("fa-volume-high");
            muteIcon.classList.add("fa-volume-xmark");
            muteBtn.title = "Activar Sonido (M)";
            songTitle.classList.remove("visible");
        }
    });

    // --- INICIALIZACIÓN DE NAVEGACIÓN ---
    createIndicatorDots();
    nextBtn.addEventListener("click", goToNextSlide);
    prevBtn.addEventListener("click", goToPrevSlide);

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") goToNextSlide();
        else if (e.key === "ArrowLeft") goToPrevSlide();
        else if (e.key.toLowerCase() === "m") muteBtn.click();
    });

    showSlide(0);

    // --- LÓGICA DEL JUEGO (REESTRUCTURADO) ---

    // 1. Bancos de Preguntas (3 preguntas por juego)
    const gameQuestions = {
        "game-1": [ // Láminas 2-4
            { question: 'Para Teresita, ¿qué representaba el piano en su infancia?', answer: 'Fue su "refugio" y "mundo mágico" donde buscaba notas "a oído" en el Palacio de Bellas Artes.' }, // Color Rojo [0]
            { question: '¿A qué edad ofreció Teresita su primer recital como solista?', answer: 'A los 10 años, gracias a su rápido progreso con la profesora Marta Agudelo de Maya.' }, // Color Blanco [1]
            { question: '¿Qué frase le decían a Teresita en la calle y qué le decía su madre adoptiva?', answer: 'En la calle le gritaban "¡Regalada!" y su madre adoptiva le decía "Vos no sos negra".' } // Color Negro [2]
        ],
        "game-2": [ // Láminas 7-9 (Símbolos 5, 6, 7)
            { question: '¿Qué alta distinción académica obtuvo Teresita en 1966?', answer: 'La distinción "Summa Cum Laude" al graduarse de la Universidad de Antioquia.' }, // Color Rojo [0]
            { question: 'Aparte del piano, ¿qué otras dos artes estudió Teresita?', answer: 'La literatura (leía a Wilde y Dostoievski) y la pintura (se colaba a clases y era modelo).' }, // Color Blanco [1]
            { question: '¿Cuántos interrogatorios soportó Teresita tras ser acusada de pertenecer al M-19?', answer: 'Soportó 18 interrogatorios durante el "Estatuto de seguridad".' } // Color Negro [2]
        ],
        "game-3": [ // Láminas 10-12 (Símbolos 8, 9, 10)
            { question: '¿Cuál es la famosa filosofía de Teresita sobre su forma de tocar Bach?', answer: '"Mi Bach no es alemán. Mi Bach debe tener su negrito bien puesto".' }, // Color Rojo [0]
            { question: '¿Qué cargo le ofreció el presidente Belisario Betancur en 1983?', answer: 'Ser Agregada Cultural en Alemania Oriental, para representar el arte del país.' }, // Color Blanco [1]
            { question: '¿Cuál es la máxima condecoración que Teresita recibió en 2005?', answer: 'La Cruz de Boyacá, la máxima distinción que otorga el Gobierno de Colombia.' } // Color Negro [2]
        ]
    };

    // 2. Rastreadores de preguntas (para no repetir)
    const gameTrackers = {
        "game-1": { asked: [] },
        "game-2": { asked: [] },
        "game-3": { asked: [] }
    };

    /**
     * Inicializa un juego (ruleta, tarjeta, botones)
     * @param {string} gameId - El prefijo del juego (ej: "game-1")
     * @param {Array} questions - El banco de preguntas para este juego
     * @param {Object} tracker - El objeto que rastrea las preguntas hechas
     */
    function initializeGame(gameId, questions, tracker) {
        // Seleccionar todos los elementos de este juego
        const context = {
            id: gameId,
            questions: questions,
            tracker: tracker,
            area: document.getElementById(`${gameId}-area`),
            spinBtn: document.getElementById(`${gameId}-spin-btn`),
            wheel: document.getElementById(`${gameId}-wheel`),
            cardInner: document.getElementById(`${gameId}-card-inner`),
            cardBack: document.getElementById(`${gameId}-card-back`),
            questionText: document.getElementById(`${gameId}-question-text`),
            showAnswerBtn: document.getElementById(`${gameId}-show-answer-btn`),
            currentQuestion: null
        };

        // Asignar evento de giro
        context.spinBtn.addEventListener("click", () => {
            if (isSpinning) return;
            isSpinning = true;
            context.spinBtn.disabled = true;

            // Lógica para no repetir
            let available = [0, 1, 2].filter(q => !context.tracker.asked.includes(q));
            if (available.length === 0) {
                // Si ya salieron todas, se resetea el rastreador
                context.tracker.asked = [];
                available = [0, 1, 2];
            }
            
            // Elegir un índice (color/pregunta) de los disponibles
            const targetIndex = available[Math.floor(Math.random() * available.length)];
            context.currentQuestion = context.questions[targetIndex];
            
            // Añadir al rastreador
            context.tracker.asked.push(targetIndex);

            // Calcular rotación para aterrizar en el color correcto
            // targetIndex 0 (Rojo): 0-119, 1 (Blanco): 120-239, 2 (Negro): 240-359
            // Queremos aterrizar en medio del segmento, ej: 60, 180, 300
            const baseAngle = (targetIndex * 120) + 60; // Centro del color
            const finalAngle = (360 - baseAngle) % 360;
            const randomSpins = (Math.floor(Math.random() * 3) + 5) * 360; // 5-7 vueltas
            const totalRotation = randomSpins + finalAngle;
            
            const spinDuration = Math.random() * 2000 + 5000; // 5-7 segundos

            // Aplicar animación
            context.wheel.style.transition = `transform ${spinDuration / 1000}s cubic-bezier(0.23, 1, 0.32, 1)`;
            context.wheel.style.transform = `rotate(${totalRotation}deg)`;

            // Esperar a que termine la animación
            setTimeout(() => {
                context.area.classList.add("game-state-question");
                context.questionText.textContent = context.currentQuestion.question;
                
                // Asignar el color de la tarjeta
                const colors = ['#a82f12', '#f5f5f5', '#333'];
                const textColors = ['#f5f5f5', '#111', '#f5f5f5']; // Colores de texto para contraste
                context.cardBack.style.backgroundColor = colors[targetIndex];
                context.cardBack.style.color = textColors[targetIndex];
                context.questionText.style.color = textColors[targetIndex]; // Asegura el color

                setTimeout(() => context.cardInner.classList.add("is-flipped"), 100);
            }, spinDuration);
        });

        // Asignar evento de ver respuesta (controla el modal)
        context.showAnswerBtn.addEventListener("click", () => {
            currentGameContext = context; // Guardar qué juego está activo
            gameAnswerText.textContent = context.currentQuestion.answer;
            modal.style.display = "block";
        });
    }

    /**
     * Resetea el juego activo después de cerrar el modal
     * @param {Object} context - El contexto del juego a resetear
     */
    function resetGame(context) {
        if (!context) return;
        
        modal.style.display = "none";
        context.cardInner.classList.remove("is-flipped");
        
        setTimeout(() => {
            context.area.classList.remove("game-state-question");
            context.wheel.style.transition = 'none';
            // Resetea a un ángulo aleatorio leve para que no siempre empiece igual
            context.wheel.style.transform = `rotate(${Math.random() * 45}deg)`; 
            void context.wheel.offsetWidth; // Forzar reflow

            isSpinning = false;
            context.spinBtn.disabled = false;
            currentGameContext = null; // Limpiar contexto
        }, 600); // Duración del flip de la tarjeta
    }

    // 3. Inicializar los 3 juegos
    initializeGame("game-1", gameQuestions["game-1"], gameTrackers["game-1"]);
    initializeGame("game-2", gameQuestions["game-2"], gameTrackers["game-2"]);
    initializeGame("game-3", gameQuestions["game-3"], gameTrackers["game-3"]);

    // 4. Asignar eventos al Modal (Pop-up)
    closeModalBtn.addEventListener("click", () => resetGame(currentGameContext));
    playAgainBtn.addEventListener("click", () => resetGame(currentGameContext));
    window.addEventListener("click", (event) => {
        if (event.target == modal) {
            resetGame(currentGameContext);
        }
    });
});