// Game setup
const canvas = document.getElementById("c"),
    ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scoreDiv = document.getElementById("score");

// Game variables
let score = 0;
let cat = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 3,
    angle: 0, // Current direction angle (in radians)
    targetX: null,
    targetY: null,
    maxTurnRate: Math.PI / 18, // Max turning rate: 10 degrees per frame
};
let fish = [];
let trail = [];
let trailLength = 10;
let keys = {};
let useMouseControl = false; // Control mode flag
let autoMode = false; // Auto hunting mode

// Setup control switches
const controlSwitch = document.getElementById("controlSwitch");
const autoSwitch = document.getElementById("autoSwitch");

controlSwitch.addEventListener("click", toggleControlMode);
autoSwitch.addEventListener("click", toggleAutoMode);

function toggleControlMode() {
    if (autoMode) return; // Cannot switch control mode while auto mode is active

    useMouseControl = !useMouseControl;
    controlSwitch.textContent = useMouseControl ? "Switch to Keyboard" : "Switch to Mouse";
}

function toggleAutoMode() {
    autoMode = !autoMode;
    autoSwitch.textContent = autoMode ? "Disable Auto Hunt" : "Enable Auto Hunt";

    // Update UI when auto mode changes
    controlSwitch.disabled = autoMode; // Disable control switch during auto mode
    controlSwitch.style.opacity = autoMode ? "0.5" : "1";
}

// Controls
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Mouse controls
canvas.addEventListener("mousemove", (e) => {
    if (useMouseControl && !autoMode) {
        const rect = canvas.getBoundingClientRect();
        cat.targetX = e.clientX - rect.left;
        cat.targetY = e.clientY - rect.top;
    }
});

// Spawn a fish at random position
function spawnFish() {
    return {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 10,
    };
}

function playFishSound() {
    try {
        zzfx(...[, , 537, 0.02, 0.02, 0.22, 1, 1.59, -6.98, 4.97]);
    } catch (e) {
        console.log("Sound error:", e);
    }
}

// Initialize with one fish
fish.push(spawnFish());

// Draw the cat
function drawCatHead() {
    // Draw the trail and body with rotation
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#333";

    trail.forEach((t, i) => {
        const alpha = 0.4 - (0.3 * i) / trail.length;
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;

        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);

        // Draw oval-shaped body segment
        ctx.beginPath();
        ctx.ellipse(0, 0, cat.size * 0.6, cat.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    });

    // Body with outline - rotated in movement direction
    ctx.save();
    ctx.translate(cat.x, cat.y);
    ctx.rotate(cat.angle);

    // Body
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(0, 0, cat.size, cat.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw the head separately without rotation to keep it facing forward
    drawCatHead(cat.x, cat.y);

    // If in auto mode, draw a target indicator
    if ((autoMode || useMouseControl) && cat.targetX !== null && cat.targetY !== null) {
        ctx.strokeStyle = "#ff0";
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(cat.x, cat.y);
        ctx.lineTo(cat.targetX, cat.targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.arc(cat.targetX, cat.targetY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCat() {
    // Đuôi
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    trail.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, cat.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });

    // Thân mèo
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, cat.size, 0, Math.PI * 2);
    ctx.fill();

    // Tai
    ctx.beginPath();
    ctx.moveTo(cat.x - 12, cat.y - 5);
    ctx.lineTo(cat.x - 22, cat.y - 20);
    ctx.lineTo(cat.x - 2, cat.y - 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cat.x + 12, cat.y - 5);
    ctx.lineTo(cat.x + 22, cat.y - 20);
    ctx.lineTo(cat.x + 2, cat.y - 15);
    ctx.fill();

    // Mắt
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cat.x - 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw a fish
function drawFish() {
    fish.forEach((f) => {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();

        // Fin
        ctx.beginPath();
        ctx.moveTo(f.x - 10, f.y);
        ctx.lineTo(f.x - 20, f.y - 8);
        ctx.lineTo(f.x - 20, f.y + 8);
        ctx.closePath();
        ctx.fill();
    });
}

// Find nearest fish to the cat
function findNearestFish() {
    if (fish.length === 0) return null;

    let nearestFish = fish[0];
    let shortestDistance = Infinity;

    for (const f of fish) {
        const dist = Math.hypot(cat.x - f.x, cat.y - f.y);
        if (dist < shortestDistance) {
            shortestDistance = dist;
            nearestFish = f;
        }
    }

    return nearestFish;
}

// Update game state
function update() {
    // First determine desired movement direction based on control mode
    let dx = 0,
        dy = 0,
        targetAngle = cat.angle;

    // Auto mode - find and chase the nearest fish
    if (autoMode) {
        const target = findNearestFish();
        if (target) {
            cat.targetX = target.x;
            cat.targetY = target.y;

            dx = cat.targetX - cat.x;
            dy = cat.targetY - cat.y;
        }
    } else if (useMouseControl) {
        // Mouse control - move cat towards target
        if (cat.targetX !== null && cat.targetY !== null) {
            dx = cat.targetX - cat.x;
            dy = cat.targetY - cat.y;
        }
    } else {
        // Keyboard control
        if (keys["ArrowUp"] || keys["w"]) dy -= 1;
        if (keys["ArrowDown"] || keys["s"]) dy += 1;
        if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
        if (keys["ArrowRight"] || keys["d"]) dx += 1;
    }

    // If we have a movement direction, calculate target angle
    if (dx !== 0 || dy !== 0) {
        targetAngle = Math.atan2(dy, dx);

        // Limit turning angle
        let angleDiff = targetAngle - cat.angle;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Apply turn rate limit
        if (angleDiff > cat.maxTurnRate) {
            cat.angle += cat.maxTurnRate;
        } else if (angleDiff < -cat.maxTurnRate) {
            cat.angle -= cat.maxTurnRate;
        } else {
            cat.angle = targetAngle;
        }

        // Move in the direction cat is facing
        cat.x += Math.cos(cat.angle) * cat.speed;
        cat.y += Math.sin(cat.angle) * cat.speed;
    }

    // Keep cat in bounds
    cat.x = Math.max(cat.size, Math.min(canvas.width - cat.size, cat.x));
    cat.y = Math.max(cat.size, Math.min(canvas.height - cat.size, cat.y));

    // Save cat position for trail
    trail.push({ x: cat.x, y: cat.y, angle: cat.angle });
    while (trail.length > trailLength) trail.shift();

    // Check for collision with fish
    fish = fish.filter((f) => {
        const dist = Math.hypot(cat.x - f.x, cat.y - f.y);
        if (dist < cat.size + f.size) {
            // Eaten!
            score++;
            scoreDiv.textContent = "Score: " + score;
            trailLength += 2;
            // Play sound when eating fish
            playFishSound();
            // Spawn a new fish
            fish.push(spawnFish());
            return false;
        }
        return true;
    });

    // Make sure there's always at least one fish
    if (fish.length === 0) {
        fish.push(spawnFish());
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    update();

    // Draw everything
    drawCat();
    drawFish();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Keep cat in bounds after resize
    cat.x = Math.max(cat.size, Math.min(canvas.width - cat.size, cat.x));
    cat.y = Math.max(cat.size, Math.min(canvas.height - cat.size, cat.y));
});

// Setup fullscreen toggle
const fullscreenToggle = document.getElementById("fullscreenToggle");
fullscreenToggle.addEventListener("click", toggleFullscreen);

// Function to toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            // Chrome, Safari, Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
        fullscreenToggle.textContent = "╳";
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            // Chrome, Safari, Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE/Edge
            document.msExitFullscreen();
        }
        fullscreenToggle.textContent = "⛶";
    }

    // After fullscreen change, update canvas dimensions
    setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, 100);
}

// Listen for fullscreen change events to update the button text
document.addEventListener("fullscreenchange", updateFullscreenButtonText);
document.addEventListener("webkitfullscreenchange", updateFullscreenButtonText);
document.addEventListener("mozfullscreenchange", updateFullscreenButtonText);
document.addEventListener("MSFullscreenChange", updateFullscreenButtonText);

function updateFullscreenButtonText() {
    if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ) {
        fullscreenToggle.textContent = "╳";
    } else {
        fullscreenToggle.textContent = "⛶";
    }
}

// Start the game
gameLoop();
