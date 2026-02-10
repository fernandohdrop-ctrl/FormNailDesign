(function () {
    // Configuration
    const MINIMUM_BEAMS = 20;
    const intensity = "strong"; // "subtle" | "medium" | "strong"
    const COLOR_PALETTES = [
        ['#ccff00', '#b3e600', '#ffffff'], // Acid Lime, Darker Lime, White
        ['#00ff66', '#00cc52', '#ffffff'], // Signal Green, Darker Green, White
        ['#d9ff33', '#ccff00', '#f0f0f0'], // Light Lime, Acid Lime, Off-white
    ];

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    // State
    let beams = [];
    let canvas = null;
    let ctx = null;
    let animationFrameId = null;

    function createBeam(width, height) {
        const angle = -35 + Math.random() * 10;
        return {
            x: Math.random() * width * 1.5 - width * 0.25,
            y: Math.random() * height * 1.5 - height * 0.25,
            width: 30 + Math.random() * 60,
            length: height * 2.5,
            angle: angle,
            speed: 0.6 + Math.random() * 1.2, // speed
            opacity: 0.12 + Math.random() * 0.16,
            hue: 190 + Math.random() * 70, // Blue-ish hues
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
        };
    }

    function resetBeam(beam, index, totalBeams) {
        if (!canvas) return beam;

        const column = index % 3;
        const spacing = canvas.width / 3;

        beam.y = canvas.height + 100;
        beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
        beam.width = 100 + Math.random() * 100;
        beam.speed = 0.5 + Math.random() * 0.4;
        beam.hue = 190 + (index * 70) / totalBeams;
        beam.opacity = 0.2 + Math.random() * 0.1;

        return beam;
    }

    function drawBeam(ctx, beam) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate((beam.angle * Math.PI) / 180);

        // Calculate pulsing opacity
        // Using intensity "strong" by default
        if (typeof opacityMap === 'undefined') {
            console.error('opacityMap is undefined!');
            return;
        }
        const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

        const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

        // Enhanced gradient
        gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
        gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
        gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
        gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
        gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
        ctx.restore();
    }

    function animate() {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Using CSS filter on canvas for blur, but we can also do ctx.filter, though usage shows context filter "blur(35px)"
        ctx.filter = "blur(35px)";

        const totalBeams = beams.length;
        beams.forEach((beam, index) => {
            beam.y -= beam.speed;
            beam.pulse += beam.pulseSpeed;

            // Reset beam when it goes off screen
            if (beam.y + beam.length < -100) {
                resetBeam(beam, index, totalBeams);
            }

            drawBeam(ctx, beam);
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    function updateCanvasSize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        // Adjust CSS size
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        ctx.resetTransform(); // clear previous scale
        ctx.scale(dpr, dpr);

        const totalBeams = MINIMUM_BEAMS * 1.5;
        // Re-initialize beams if needed or just keep them
        if (beams.length === 0) {
            beams = Array.from({ length: totalBeams }, () => createBeam(canvas.width / dpr, canvas.height / dpr));
        }
    }

    function init() {
        // Create container elements
        const container = document.createElement('div');
        container.className = 'beams-bg-container';

        canvas = document.createElement('canvas');
        canvas.className = 'beams-canvas';

        const overlay = document.createElement('div');
        overlay.className = 'beams-overlay';

        container.appendChild(canvas);
        container.appendChild(overlay);
        document.body.prepend(container);

        ctx = canvas.getContext('2d');

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        animate();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
