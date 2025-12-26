// Contraseña correcta
const CORRECT_PASSWORD = "teamomh";

// Elementos del DOM
const lockScreen = document.getElementById('lock-screen');
const albumContainer = document.getElementById('album-container');
const goodbyeScreen = document.getElementById('goodbye-screen');
const draggableKey = document.getElementById('draggable-key');
const lock = document.querySelector('.lock');
const exitLock = document.getElementById('exit-lock');
const keyTrail = document.getElementById('key-trail');
const passwordForm = document.getElementById('password-form');
const passwordInput = document.getElementById('password-input');
const passwordButton = document.getElementById('password-button');
const errorMessage = document.getElementById('error-message');
const pages = document.querySelectorAll('.page');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const pageDotsContainer = document.getElementById('page-dots');

// Variables de control
let currentPage = 0;
const totalPages = pages.length;
let isDragging = false;
let keyPosition = { x: 0, y: 0 };
let lockPosition = { x: 0, y: 0 };
let startPosition = { x: 0, y: 0 };
let trailPoints = [];
let fireworksInterval;

// Dimensiones responsivas del área de juego
function calculateGameDimensions() {
    const gameArea = document.querySelector('.lock-game-area');
    const rect = gameArea.getBoundingClientRect();
    
    // Posiciones relativas al área de juego
    lockPosition = {
        x: rect.width * 0.75,
        y: rect.height * 0.5
    };
    
    startPosition = {
        x: rect.width * 0.25,
        y: rect.height * 0.5
    };
    
    // Posicionar la llave
    keyPosition = { ...startPosition };
    draggableKey.style.left = startPosition.x + 'px';
    draggableKey.style.top = startPosition.y + 'px';
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Configurar número total de páginas
    totalPagesSpan.textContent = totalPages;
    
    // Calcular dimensiones iniciales
    calculateGameDimensions();
    
    // Crear puntos de navegación
    createPageDots();
    
    // Configurar eventos de arrastre de la llave
    setupDragAndDrop();
    
    // Configurar eventos de navegación
    prevBtn.addEventListener('click', goToPrevPage);
    nextBtn.addEventListener('click', goToNextPage);
    
    // Configurar evento del botón de contraseña
    passwordButton.addEventListener('click', checkPassword);
    
    // Configurar evento del candado de salida
    exitLock.addEventListener('click', closeAlbum);
    
    // Permitir presionar Enter en el campo de contraseña
    passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Actualizar dimensiones al redimensionar ventana
    window.addEventListener('resize', calculateGameDimensions);
});

// Configurar arrastre de la llave para móviles y desktop
function setupDragAndDrop() {
    // Eventos para mouse
    draggableKey.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    // Eventos para touch
    draggableKey.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

// Funciones para arrastre con mouse
function startDrag(e) {
    isDragging = true;
    draggableKey.style.cursor = 'grabbing';
    trailPoints = [{ x: keyPosition.x, y: keyPosition.y }];
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const gameArea = document.querySelector('.lock-game-area');
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;
    
    updateKeyPosition(x, y, rect);
}

// Funciones para arrastre táctil
function startDragTouch(e) {
    isDragging = true;
    trailPoints = [{ x: keyPosition.x, y: keyPosition.y }];
    e.preventDefault();
}

function dragTouch(e) {
    if (!isDragging || !e.touches.length) return;
    
    const gameArea = document.querySelector('.lock-game-area');
    const rect = gameArea.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left - 40;
    const y = touch.clientY - rect.top - 40;
    
    updateKeyPosition(x, y, rect);
}

function stopDrag() {
    isDragging = false;
    draggableKey.style.cursor = 'grab';
}

// Actualizar posición de la llave
function updateKeyPosition(x, y, rect) {
    // Limitar la llave al área del juego
    const boundedX = Math.max(0, Math.min(x, rect.width - 80));
    const boundedY = Math.max(0, Math.min(y, rect.height - 80));
    
    draggableKey.style.left = boundedX + 'px';
    draggableKey.style.top = boundedY + 'px';
    
    // Guardar posición para el rastro
    keyPosition.x = boundedX;
    keyPosition.y = boundedY;
    trailPoints.push({ x: boundedX, y: boundedY });
    
    // Actualizar rastro visual
    updateKeyTrail();
    
    // Verificar si la llave está cerca del candado
    checkKeyInLock(boundedX, boundedY);
}

// Actualizar el rastro de la llave
function updateKeyTrail() {
    if (trailPoints.length < 2) return;
    
    // Mantener solo los últimos 15 puntos para el rastro
    if (trailPoints.length > 15) {
        trailPoints = trailPoints.slice(trailPoints.length - 15);
    }
    
    // Crear una línea desde el primer punto hasta el último
    const firstPoint = trailPoints[0];
    const lastPoint = trailPoints[trailPoints.length - 1];
    
    // Calcular distancia y ángulo
    const dx = lastPoint.x - firstPoint.x;
    const dy = lastPoint.y - firstPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Actualizar el elemento del rastro
    keyTrail.style.width = distance + 'px';
    keyTrail.style.height = '4px';
    keyTrail.style.left = (firstPoint.x + 40) + 'px';
    keyTrail.style.top = (firstPoint.y + 40) + 'px';
    keyTrail.style.transform = `rotate(${angle}deg)`;
    keyTrail.style.opacity = '0.7';
}

// Verificar si la llave está en el candado
function checkKeyInLock(keyX, keyY) {
    const distance = Math.sqrt(
        Math.pow(keyX - lockPosition.x, 2) + 
        Math.pow(keyY - lockPosition.y, 2)
    );
    
    const threshold = window.innerWidth < 480 ? 80 : 60;
    
    if (distance < threshold) {
        // Llave en el candado
        lock.classList.remove('locked');
        lock.classList.add('unlocked');
        lock.innerHTML = '<i class="fas fa-lock-open"></i>';
        
        // Reproducir sonido de desbloqueo
        playUnlockSound();
        
        // Mostrar formulario de contraseña después de un breve retraso
        setTimeout(() => {
            passwordForm.style.display = 'block';
            passwordInput.focus();
            
            // Agregar efecto de confeti
            createConfetti();
        }, 500);
    } else {
        lock.classList.remove('unlocked');
        lock.classList.add('locked');
        lock.innerHTML = '<i class="fas fa-lock"></i>';
    }
}

// Crear efecto de confeti
function createConfetti() {
    const gameArea = document.querySelector('.lock-game-area');
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.innerHTML = '<i class="fas fa-heart"></i>';
        confetti.style.position = 'absolute';
        confetti.style.color = ['#ff6b8b', '#7b5dd6', '#9d8aff', '#ffd166'][Math.floor(Math.random() * 4)];
        confetti.style.fontSize = Math.random() * 15 + 10 + 'px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-30px';
        confetti.style.opacity = '0.8';
        confetti.style.zIndex = '5';
        
        gameArea.appendChild(confetti);
        
        // Animación del confeti
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
            { transform: `translateY(${gameArea.offsetHeight + 30}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1500 + 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        // Eliminar confeti después de la animación
        animation.onfinish = () => confetti.remove();
    }
}

// Reproducir sonido de desbloqueo
function playUnlockSound() {
    // Crear audio de desbloqueo simple
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log("Audio no disponible");
    }
}

// Función para verificar la contraseña
function checkPassword() {
    const enteredPassword = passwordInput.value.trim().toLowerCase();
    
    if (enteredPassword === CORRECT_PASSWORD) {
        // Contraseña correcta
        errorMessage.style.display = 'none';
        
        // Animación de desbloqueo final
        lock.style.transform = 'scale(1.5)';
        lock.style.color = '#5dd67b';
        
        // Mostrar el álbum después de un retraso
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            setTimeout(() => {
                albumContainer.classList.add('visible');
                // Forzar reflow para asegurar animación
                albumContainer.offsetHeight;
            }, 500);
        }, 1000);
        
    } else {
        // Contraseña incorrecta
        errorMessage.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
        
        // Efecto de vibración
        lockScreen.style.animation = 'shake 0.5s';
        setTimeout(() => {
            lockScreen.style.animation = '';
        }, 500);
    }
}

// Función para cerrar el álbum con efectos
function closeAlbum() {
    // Ocultar el álbum
    albumContainer.classList.remove('visible');
    
    // Mostrar pantalla de despedida después de un breve retraso
    setTimeout(() => {
        goodbyeScreen.classList.add('visible');
        
        // Iniciar efectos de fuegos artificiales
        startFireworks();
        
        // Crear confeti
        createGoodbyeConfetti();
        
        // Cerrar todo después de 4 segundos
        setTimeout(() => {
            goodbyeScreen.classList.remove('visible');
            stopFireworks();
            
            // Volver a mostrar la pantalla de acceso después de un momento
            setTimeout(() => {
                location.reload();
            }, 1000);
        }, 4000);
    }, 500);
}

// Iniciar fuegos artificiales
function startFireworks() {
    // Crear fuegos artificiales cada 400ms
    fireworksInterval = setInterval(createFirework, 400);
}

// Detener fuegos artificiales
function stopFireworks() {
    clearInterval(fireworksInterval);
}

// Crear un fuego artificial
function createFirework() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // Posición aleatoria
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight / 2);
    
    // Color aleatorio
    const colors = ['#ff6b8b', '#7b5dd6', '#9d8aff', '#ffd166', '#5dd67b'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Estilo del fuego artificial
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    firework.style.backgroundColor = color;
    firework.style.boxShadow = `0 0 10px ${color}`;
    
    document.body.appendChild(firework);
    
    // Animación del fuego artificial
    const size = Math.random() * 10 + 5;
    const explosionSize = Math.random() * 80 + 40;
    
    const animation = firework.animate([
        { width: '5px', height: '5px', opacity: 1, transform: 'translate(0, 0)' },
        { width: `${size}px`, height: `${size}px`, opacity: 0.8, transform: 'translate(0, 0)' },
        { width: `${explosionSize}px`, height: `${explosionSize}px`, opacity: 0, transform: `translate(${Math.random() * 80 - 40}px, ${Math.random() * 80 - 40}px)` }
    ], {
        duration: Math.random() * 800 + 500,
        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
    });
    
    // Eliminar fuego artificial después de la animación
    animation.onfinish = () => firework.remove();
}

// Crear confeti para la despedida
function createGoodbyeConfetti() {
    const confettiCount = window.innerWidth < 480 ? 100 : 200;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Forma aleatoria
            const shapes = ['❤️', '💖', '💕', '💗'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.innerHTML = shape;
            
            // Posición aleatoria
            const x = Math.random() * window.innerWidth;
            
            // Color aleatorio
            const colors = ['#ff6b8b', '#7b5dd6', '#9d8aff', '#ffd166'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Estilo del confeti
            confetti.style.left = x + 'px';
            confetti.style.top = '-20px';
            confetti.style.color = color;
            confetti.style.fontSize = Math.random() * 15 + 10 + 'px';
            confetti.style.opacity = '0.9';
            confetti.style.zIndex = '2001';
            confetti.style.position = 'fixed';
            
            document.body.appendChild(confetti);
            
            // Animación del confeti
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 0.9 },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2500 + 1500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)',
                delay: Math.random() * 500
            });
            
            // Eliminar confeti después de la animación
            animation.onfinish = () => confetti.remove();
        }, i * 20);
    }
}

// Crear puntos de navegación
function createPageDots() {
    pageDotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i === 0) dot.classList.add('active');
        dot.dataset.page = i;
        dot.addEventListener('click', function() {
            goToPage(parseInt(this.dataset.page));
        });
        pageDotsContainer.appendChild(dot);
    }
}

// Ir a la página anterior
function goToPrevPage() {
    if (currentPage > 0) {
        goToPage(currentPage - 1);
    }
}

// Ir a la página siguiente
function goToNextPage() {
    if (currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
    }
}

// Ir a una página específica
function goToPage(pageNumber) {
    // Ocultar página actual
    pages[currentPage].classList.remove('active');
    document.querySelectorAll('.dot')[currentPage].classList.remove('active');
    
    // Mostrar nueva página
    currentPage = pageNumber;
    pages[currentPage].classList.add('active');
    document.querySelectorAll('.dot')[currentPage].classList.add('active');
    
    // Actualizar contador
    currentPageSpan.textContent = currentPage + 1;
    
    // Actualizar estado de los botones
    updateButtons();
    
    // Desplazar suavemente hacia arriba
    document.querySelector('.album-pages').scrollTop = 0;
}

// Actualizar estado de los botones
function updateButtons() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

// Navegación con teclado
document.addEventListener('keydown', function(event) {
    if (albumContainer.classList.contains('visible')) {
        if (event.key === 'ArrowLeft') {
            goToPrevPage();
        } else if (event.key === 'ArrowRight') {
            goToNextPage();
        } else if (event.key === 'Escape') {
            closeAlbum();
        }
    }
});

// Navegación con gestos táctiles (swipe)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    if (albumContainer.classList.contains('visible')) {
        touchStartX = event.changedTouches[0].screenX;
    }
}, { passive: true });

document.addEventListener('touchend', function(event) {
    if (albumContainer.classList.contains('visible')) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe izquierda - ir a siguiente página
            goToNextPage();
        } else {
            // Swipe derecha - ir a página anterior
            goToPrevPage();
        }
    }
}

// Optimizar imágenes al cargar
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.page-image');
    
    images.forEach(img => {
        // Precargar imágenes
        if (img.complete) {
            optimizeImage(img);
        } else {
            img.addEventListener('load', () => optimizeImage(img));
        }
    });
});

function optimizeImage(img) {
    // Asegurar que las imágenes se muestren correctamente
    img.style.opacity = '1';
}

// Prevenir zoom en input en iOS
document.addEventListener('touchstart', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        event.target.style.fontSize = '16px';
    }
});

// Ajustar para teclado virtual en móviles
window.addEventListener('resize', function() {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Mejorar rendimiento en dispositivos móviles
let lastScrollTime = 0;
window.addEventListener('scroll', function() {
    const now = Date.now();
    if (now - lastScrollTime > 100) {
        lastScrollTime = now;
        requestAnimationFrame(updateParallax);
    }
});

function updateParallax() {
    // Efectos de paralaje opcionales para mejorar la experiencia
    const scrollY = window.scrollY;
    const decorations = document.querySelectorAll('.decoration');
    
    decorations.forEach((dec, index) => {
        const speed = 0.3 + (index * 0.1);
        dec.style.transform = `translateY(${scrollY * speed}px)`;
    });
}
