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
    targetX: null, // Target position for mouse following
    targetY: null,
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
    // Update the controls text
    document.getElementById("controls").textContent = useMouseControl
        ? "Move the mouse to guide the cat"
        : "Use Arrow keys or WASD to move";
}

function toggleAutoMode() {
    autoMode = !autoMode;
    autoSwitch.textContent = autoMode ? "Disable Auto Hunt" : "Enable Auto Hunt";

    // Update UI when auto mode changes
    controlSwitch.disabled = autoMode; // Disable control switch during auto mode
    controlSwitch.style.opacity = autoMode ? "0.5" : "1";

    document.getElementById("controls").textContent = autoMode
        ? "Auto hunting mode: Cat will chase fish automatically"
        : useMouseControl
        ? "Move the mouse to guide the cat"
        : "Use Arrow keys or WASD to move";
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
function drawCat() {
    // Trail
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    trail.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, cat.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });

    // Body
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, cat.size, 0, Math.PI * 2);
    ctx.fill();

    // Ears
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

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cat.x - 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // If in auto mode, draw a target indicator
    if (autoMode && cat.targetX !== null && cat.targetY !== null) {
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
    // Auto mode - find and chase the nearest fish
    if (autoMode) {
        const target = findNearestFish();
        if (target) {
            cat.targetX = target.x;
            cat.targetY = target.y;
        }
    }

    // Handle movement based on control mode
    if (autoMode || useMouseControl) {
        // Mouse or auto control - move cat towards target
        if (cat.targetX !== null && cat.targetY !== null) {
            const dx = cat.targetX - cat.x;
            const dy = cat.targetY - cat.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > cat.speed) {
                // Move towards target
                cat.x += (dx / distance) * cat.speed;
                cat.y += (dy / distance) * cat.speed;
            } else {
                // Close enough, snap to target
                cat.x = cat.targetX;
                cat.y = cat.targetY;
            }
        }
    } else {
        // Keyboard control
        if (keys["ArrowUp"] || keys["w"]) cat.y -= cat.speed;
        if (keys["ArrowDown"] || keys["s"]) cat.y += cat.speed;
        if (keys["ArrowLeft"] || keys["a"]) cat.x -= cat.speed;
        if (keys["ArrowRight"] || keys["d"]) cat.x += cat.speed;
    }

    // Keep cat in bounds
    cat.x = Math.max(cat.size, Math.min(canvas.width - cat.size, cat.x));
    cat.y = Math.max(cat.size, Math.min(canvas.height - cat.size, cat.y));

    // Save cat position for trail
    trail.push({ x: cat.x, y: cat.y });
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
    drawFish();
    drawCat();

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

// Start the game
gameLoop();
