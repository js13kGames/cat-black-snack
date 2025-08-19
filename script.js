const canvas = document.getElementById("c"),
    ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let cat = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 3,
};

let mouse = { x: cat.x, y: cat.y };
let trail = [];
let trailLength = 10;
let fish = spawnFish();
let score = 0;

document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function spawnFish() {
    zzfx(...[1, 0.05, 440, 0.05, 0.1, 0.2, 1, 0, 0]);
    return {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 10,
    };
}

function drawCat() {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    trail.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, cat.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, cat.size, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cat.x - 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 6, cat.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawFish() {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(fish.x, fish.y, fish.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(fish.x - 10, fish.y);
    ctx.lineTo(fish.x - 20, fish.y - 8);
    ctx.lineTo(fish.x - 20, fish.y + 8);
    ctx.closePath();
    ctx.fill();
}

function update() {
    let dx = mouse.x - cat.x;
    let dy = mouse.y - cat.y;
    let dist = Math.hypot(dx, dy);

    if (dist > 1) {
        cat.x += (dx / dist) * cat.speed;
        cat.y += (dy / dist) * cat.speed;
    }

    cat.x = Math.max(cat.size, Math.min(canvas.width - cat.size, cat.x));
    cat.y = Math.max(cat.size, Math.min(canvas.height - cat.size, cat.y));

    trail.push({ x: cat.x, y: cat.y });
    while (trail.length > trailLength) trail.shift();

    let distFish = Math.hypot(cat.x - fish.x, cat.y - fish.y);
    if (distFish < cat.size + fish.size) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        trailLength += 5;
        fish = spawnFish();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    drawCat();
    drawFish();
    requestAnimationFrame(loop);
}

loop();
