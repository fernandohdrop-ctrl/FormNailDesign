/**
 * Shooting Stars Animation (Vanilla JS adaptation of React component)
 */
class ShootingStar {
    constructor(options = {}) {
        this.options = {
            minSpeed: options.minSpeed || 10,
            maxSpeed: options.maxSpeed || 30,
            minDelay: options.minDelay || 1200,
            maxDelay: options.maxDelay || 4200,
            starColor: options.starColor || "#9E00FF",
            trailColor: options.trailColor || "#2EB9DF",
            starWidth: options.starWidth || 10,
            starHeight: options.starHeight || 1,
            container: options.container || document.body
        };

        this.star = null;
        this.svg = null;
        this.rect = null;
        this.gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
        this.animationFrame = null;
        this.timeout = null;

        this.init();
    }

    init() {
        // Create SVG element
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.classList.add("shooting-star-svg");
        this.svg.style.position = "absolute";
        this.svg.style.top = "0";
        this.svg.style.left = "0";
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        this.svg.style.pointerEvents = "none";
        this.svg.style.zIndex = "-1"; // Ensure it's behind content

        // Create Gradient Definition
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        linearGradient.setAttribute("id", this.gradientId);
        linearGradient.setAttribute("x1", "0%");
        linearGradient.setAttribute("y1", "0%");
        linearGradient.setAttribute("x2", "100%");
        linearGradient.setAttribute("y2", "100%");

        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.style.stopColor = this.options.trailColor;
        stop1.style.stopOpacity = "0";

        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.style.stopColor = this.options.starColor;
        stop2.style.stopOpacity = "1";

        linearGradient.appendChild(stop1);
        linearGradient.appendChild(stop2);
        defs.appendChild(linearGradient);
        this.svg.appendChild(defs);

        this.options.container.appendChild(this.svg);

        this.createStar();
    }

    getRandomStartPoint() {
        const side = Math.floor(Math.random() * 4);
        const offset = Math.random() * window.innerWidth;

        switch (side) {
            case 0: return { x: offset, y: 0, angle: 45 };
            case 1: return { x: window.innerWidth, y: offset, angle: 135 };
            case 2: return { x: offset, y: window.innerHeight, angle: 225 };
            case 3: return { x: 0, y: offset, angle: 315 };
            default: return { x: 0, y: 0, angle: 45 };
        }
    }

    createStar() {
        const { x, y, angle } = this.getRandomStartPoint();

        this.star = {
            id: Date.now(),
            x,
            y,
            angle,
            scale: 1,
            speed: Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed,
            distance: 0
        };

        // Create or update rect element
        if (!this.rect) {
            this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.rect.setAttribute("fill", `url(#${this.gradientId})`);
            this.rect.setAttribute("height", this.options.starHeight);
            this.svg.appendChild(this.rect);
        }

        this.updateStarVisuals(); // Set initial position

        const randomDelay = Math.random() * (this.options.maxDelay - this.options.minDelay) + this.options.minDelay;

        // Start animation loop
        this.animate();

        // Schedule next star creation
        // Note: The original React code uses setTimeout inside createStar BEFORE animating?
        // Ah, the React code `createStar` sets state, and the effect runs `createStar` again after delay.
        // Wait, the React code has `setTimeout(createStar, randomDelay)` inside `createStar`.
        // AND it has a separate effect for `moveStar`.
        // The `createStar` function essentially resets the star position every X seconds.
        // Let's mimic that behavior.

        // Clear previous timeout if any
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.createStar(), randomDelay);
    }

    animate() {
        if (!this.star) return;

        const { x, y, angle, speed, distance } = this.star;

        const newX = x + speed * Math.cos((angle * Math.PI) / 180);
        const newY = y + speed * Math.sin((angle * Math.PI) / 180);
        const newDistance = distance + speed;
        const newScale = 1 + newDistance / 100;

        // Check bounds
        if (
            newX < -20 ||
            newX > window.innerWidth + 20 ||
            newY < -20 ||
            newY > window.innerHeight + 20
        ) {
            // Star went off screen. Wait for next creation cycle.
            // But we should hide it.
            if (this.rect) this.rect.style.display = 'none';
            // Cancel this animation frame loop until next createStar
            if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
            return;
        }

        // Update state
        this.star.x = newX;
        this.star.y = newY;
        this.star.distance = newDistance;
        this.star.scale = newScale;

        // Update visual
        this.updateStarVisuals();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    updateStarVisuals() {
        if (!this.rect || !this.star) return;

        this.rect.style.display = 'block';
        this.rect.setAttribute("x", this.star.x);
        this.rect.setAttribute("y", this.star.y);
        this.rect.setAttribute("width", this.options.starWidth * this.star.scale);
        this.rect.setAttribute(
            "transform",
            `rotate(${this.star.angle}, ${this.star.x + (this.options.starWidth * this.star.scale) / 2
            }, ${this.star.y + this.options.starHeight / 2})`
        );
    }
}

// Initialize stars when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'stars-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';

    // Add static stars background
    const starsBg = document.createElement('div');
    starsBg.className = 'stars-background';
    document.body.prepend(starsBg);

    document.body.prepend(container);

    // Star 1
    new ShootingStar({
        container,
        starColor: "#9E00FF",
        trailColor: "#2EB9DF",
        minSpeed: 15,
        maxSpeed: 35,
        minDelay: 1000,
        maxDelay: 3000
    });

    // Star 2
    new ShootingStar({
        container,
        starColor: "#FF0099",
        trailColor: "#FFB800",
        minSpeed: 10,
        maxSpeed: 25,
        minDelay: 2000,
        maxDelay: 4000
    });

    // Star 3
    new ShootingStar({
        container,
        starColor: "#00FF9E",
        trailColor: "#00B8FF",
        minSpeed: 20,
        maxSpeed: 40,
        minDelay: 1500,
        maxDelay: 3500
    });
});
