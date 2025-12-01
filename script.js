// Slide Navigation
let currentSlide = 1;
const totalSlides = 4;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function updateSlide() {
    // Update slide visibility
    slides.forEach((slide, index) => {
        if (index + 1 === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index + 1 === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });

    // Update navigation buttons
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlide();
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlide();
    }
}

function goToSlide(slideNumber) {
    if (slideNumber >= 1 && slideNumber <= totalSlides) {
        currentSlide = slideNumber;
        updateSlide();
    }
}

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index + 1));
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    }
});

// Three.js 3D Floral Animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Transparent background

camera.position.z = 5;

// Create floating petals
const petals = [];
const petalCount = 50;

function createPetal() {
    const geometry = new THREE.PlaneGeometry(0.1, 0.2);
    const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xFFB6C1 : 0xDDA0DD,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });

    const petal = new THREE.Mesh(geometry, material);

    // Random position
    petal.position.x = (Math.random() - 0.5) * 20;
    petal.position.y = (Math.random() - 0.5) * 20;
    petal.position.z = (Math.random() - 0.5) * 10;

    // Random rotation
    petal.rotation.x = Math.random() * Math.PI;
    petal.rotation.y = Math.random() * Math.PI;
    petal.rotation.z = Math.random() * Math.PI;

    // Animation properties
    petal.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
    };

    scene.add(petal);
    return petal;
}

// Create petals
for (let i = 0; i < petalCount; i++) {
    petals.push(createPetal());
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    petals.forEach((petal, index) => {
        // Floating motion
        petal.position.y += Math.sin(time + petal.userData.floatOffset) * petal.userData.floatSpeed;

        // Gentle rotation
        petal.rotation.x += petal.userData.rotationSpeed.x;
        petal.rotation.y += petal.userData.rotationSpeed.y;
        petal.rotation.z += petal.userData.rotationSpeed.z;

        // Reset position if petal goes too far
        if (petal.position.y > 15) {
            petal.position.y = -15;
            petal.userData.floatOffset = Math.random() * Math.PI * 2;
        }
    });

    // Subtle camera movement
    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = Math.cos(time * 0.1) * 0.5;

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Initialize
updateSlide();
animate();

// Add some interactive elements
document.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    camera.position.x += mouseX * 0.01;
    camera.position.y += mouseY * 0.01;
});

// Auto-advance slides (optional, can be disabled)
let autoAdvanceInterval;
function startAutoAdvance() {
    autoAdvanceInterval = setInterval(() => {
        if (currentSlide < totalSlides) {
            nextSlide();
        } else {
            goToSlide(1); // Loop back to first slide
        }
    }, 5000); // Change slide every 5 seconds
}

// Uncomment to enable auto-advance
// startAutoAdvance();

// Pause auto-advance on user interaction
function pauseAutoAdvance() {
    if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = null;
    }
}

document.addEventListener('click', pauseAutoAdvance);
document.addEventListener('keydown', pauseAutoAdvance);