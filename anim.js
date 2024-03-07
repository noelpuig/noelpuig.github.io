const canvas = document.getElementById("animation");
const ctx = canvas.getContext("2d", { alpha: false });
const click_containter = document.getElementById("click-listener");

var mouse_down_position = [];
var particles = [];
var colliders = [];

var animation;
var animation_running = 0;
const lifespan_stationary = 0.5;
const fps = 60;

class Particle {
    constructor(startX, startY, velX, velY, scale, color, friction, lifespan, type) {
        this.startX = startX;
        this.startY = startY;
        this.velX = velX/5;
        this.velY = velY/5;
        this.scale = scale;
        this.todissapear = lifespan_stationary * fps;
        this.color = color;
        this.x = startX, this.y = startY;
        this.type = type;
        this.frame = 0;
        this.friction = 1 + friction/100;
        this.lifespan = lifespan * fps; // In seconds
    }

    updateAnim1 () {
        if (this.x + this.scale > canvas.width || this.x - this.scale < 0) {
            this.velX = -this.velX;
        }
        if (this.y + this.scale > canvas.height - 75 || this.y - this.scale < 0) {
            this.velY = -this.velY;
        }

        this.x += this.velX;
        this.y += this.velY;
        this.velX /= this.friction;
        this.velY /= this.friction;

        // Color
        let start = [0, 63, 41];
        let end = [0, 0, 95];
        let transition = this.frame / this.lifespan;
        let h = Math.trunc(start[0] + (end[0] - start[0]) * transition);
        let s = Math.trunc(start[1] + (end[1] - start[1]) * transition);
        let l = Math.trunc(start[2] + (end[2] - start[2]) * transition);
        this.color = 'hsl(0,' + s + '%,' + l + '%)';

        let totalVel = Math.sqrt(this.velX**2 + this.velY**2);
        if (this.type == "main" && totalVel > 1.5 && this.frame % 2 == 0) {
            particles.push(new Particle(this.x, this.y, this.velY, -this.velX, 2, "#F2F2F2", 1, 5, "secondary"));
            particles.push(new Particle(this.x, this.y, -this.velY, this.velX, 2, "#F2F2F2", 1, 5, "secondary"));
        }
        if (this.type == "secondary" && totalVel > 1.5 && this.frame % 5 == 0) {
            particles.push(new Particle(this.x, this.y, this.velY, -this.velX, 1, "#F2F2F2", 1, 5, "thirdary"));
            particles.push(new Particle(this.x, this.y, -this.velY, this.velX, 1, "#F2F2F2", 1, 5, "thirdary"));
        }
        this.frame++;

        if (this.frame > 30 && ( this.type == "main")) {
            for (let i = 0; i < colliders.length; i++) {
                let collider = colliders[i];
                if (collider.type == "circle") {
                    let dist_vector = [collider.x - this.x, collider.y - this.y];
                    let dist = Math.sqrt(dist_vector[0]**2 + dist_vector[1]**2);
                    if (dist < 15) {
                        let unit_vector = [dist_vector[0] / dist, dist_vector[1] /dist];
                        this.velX *= -unit_vector[0];
                        this.velY *= -unit_vector[1];
                        this.velX += collider.velX;
                        this.velY += collider.velY;
                    }
                }
            }
            particles.forEach(particle => {
                if (particle != this && particle.type == "main") {
                    let dist_vector = [particle.x - this.x, particle.y - this.y];
                    let dist = Math.sqrt(dist_vector[0]**2 + dist_vector[1]**2);
                    if (dist < 15) {
                        let unit_vector = [dist_vector[0] / dist, dist_vector[1] /dist];
                        this.velX *= -unit_vector[0];
                        this.velY *= -unit_vector[1];
                        this.velX += particle.velX;
                        this.velY += particle.velY;
                    }
                }
            });
        }    
        if (totalVel < 0.1) {
            this.todissapear--;
        } else {
            this.todissapear = lifespan_stationary * fps;
        }
        this.velX = Math.trunc(this.velX * 10000) / 10000;
        this.velY = Math.trunc(this.velY * 10000) / 10000;
        this.x = Math.trunc(this.x * 10000) / 10000;
        this.y = Math.trunc(this.y * 10000) / 10000;
    }
}

class Collider {
    constructor (x, y, scaleX, scaleY, type, color) {
        this.x = x;
        this.y = y;
        this.velX, this.velY;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.type = type;  
        this.color = color;
    }

    draw () {
        switch (type) {
            case "circle":
                drawCircle(this.x, this.y, this.scaleX, "#fff");
                break;
        }
    }

    newPos (x, y) {
        this.velX = x - this.x;
        this.velY = y - this.y;
        this.x = x;
        this.y = y; 
        this.velX = Math.trunc(this.velX * 100) / 100;
        this.velY = Math.trunc(this.velY * 100) / 100;
        this.x = Math.trunc(this.x * 100) / 100;
        this.y = Math.trunc(this.y * 100) / 100;
    }
}

function drawCircle(x, y, scale, color) {
    if (scale > 35) scale = 35;
    if (scale < 0.5) scale = 0.5;
    ctx.beginPath();
    ctx.fillStyle = color; // Fill color
    ctx.arc(Math.trunc(x), Math.trunc(y), Math.trunc(scale), 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
}

function newFrame () {
    if (particles.length == 0) {
        clearInterval(animation);
        animation_running = 0;
    }
    for (let i = 0; i < particles.length; i++) {
        particles[i].updateAnim1();
        if (particles[i].frame > particles[i].lifespan && particles[i].todissapear <= 0) particles.splice(i, 1);
    }
    drawFrame(true);
}

function drawFrame (clear) {
    if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        drawCircle(particle.x, particle.y, particle.scale, particle.color);
    });
    colliders.forEach(collider => {
        drawCircle(collider.x, collider.y, collider.scaleX, collider.color);
    });
}

const maxRadius = 90; // Maximum radius for the circular lin
function getEnd (e) {
    // Calculate the distance from the starting point to the current mouse position
    let distX = e.pageX - mouse_down_position[0];
    let distY = e.pageY - mouse_down_position[1];
    let distance = Math.sqrt(distX ** 2 + distY ** 2); // Euclidean distance

    // Limit the distance to the maximum radius
    let limitedDistance = Math.min(distance, maxRadius);

    // Calculate the adjusted coordinates for the line end
    let endX = mouse_down_position[0] + (limitedDistance * (distX / distance));
    let endY = mouse_down_position[1] + (limitedDistance * (distY / distance));
    
    return [endX, endY];
}

function newLine(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(true);
    ctx.beginPath();
    ctx.moveTo(mouse_down_position[0], mouse_down_position[1]);
    ctx.lineWidth = 3;
    let [endX, endY] = getEnd(e);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#F2F2F2";
    ctx.stroke();
}

click_containter.addEventListener('mousemove', customPointer, true);
var mouseCollider = new Collider(-100, -100, 15, 15, "circle" , "#efefef");
colliders.push(mouseCollider);
function customPointer (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(false);
    // Change this to velocity
    mouseCollider.newPos(e.pageX, e.pageY);
}

click_containter.addEventListener('mousedown', mouseDown, false);
function mouseDown (e) {
    click_containter.addEventListener('mousemove', newLine, true);
    mouse_down_position = [e.pageX, e.pageY];
}

click_containter.addEventListener('mouseup', mouseUp, false);
function mouseUp (e) {
    click_containter.removeEventListener('mousemove', newLine, true);
    let [endX, endY] = getEnd(e);
    let vel = [-(endX - mouse_down_position[0]), -(endY - mouse_down_position[1])]

    var particle = new Particle(endX, endY, vel[0], vel[1], 10, "#F2F2F2", 2, 10, "main")
    particles.push(particle);
    colliders.push(particle);
    if (!animation_running) {
        animation = setInterval(newFrame, 1000/fps);
        animation_running = 1;
    }
}

const container = document.getElementById("main-page");
function resize () {
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    canvas.width = w;
    canvas.height = h;
}
window.addEventListener("resize", resize, false);
window.addEventListener("load", resize, false);
