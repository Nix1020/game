/** @type {HTMLCanvasElement}*/
let canv = document.getElementById('gameCanvas'); //decalaring canvas
let ctx = canv.getContext('2d');

const FPS = 120; //frames per second
const SHIP_SIZE = 30; //fize in pixels
const TURN_SPEED = 360; //turn speed in degrees persecond
const SHIP_THRUST = 6; // 5px/s
const FRICTION = 0.5; // SLOW THAT BOY (0 = no frick 1 is losts)
const SHIP_TRAIL_COLOR = "grey";
class Ship {
    constructor(canvId='gameCanvas', x=-1, y=-1, radius=SHIP_SIZE, angle=90, color="white") {
        this.canv = document.getElementById(canvId);
        this.ctx = this.canv.getContext('2d');
        if (x == -1)
            x = this.canv.width / 2;
        if (y == -1)
            y = this.canv.height / 2;
        this.x = x;
        this.y = y;
        this.r = radius / 2;
        this.a = angle / 180 * Math.PI;
        this.rot = 0;
        this.color = color;
        this.thrusting = false;
        this.trailColor = "";
        this.trail = [{
            x:-1,y:-1
        }];
        this.thrust = {
            x: 0,
            y: 0
        }
    }

    keyDown(ev) {
        switch (ev.keyCode) {
            case 37: // left arrow (rotate ship left)
                this.rot = TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case 38: // up arrow (thrust the ship forward)
                this.thrusting = true;
                break;
            case 39: // right arrow (rotate ship right)
                this.rot = -TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case 32: // space bar
                this.trailColor = SHIP_TRAIL_COLOR;
                break;
        }
    }
    keyUp(ev) {
        switch (ev.keyCode) {
            case 37: // left arrow (stop rotating left)
                this.rot = 0;
                break;
            case 38: // up arrow (stop thrusting)
                this.thrusting = false;
                break;
            case 39: // right arrow (stop rotating right)
                this.rot = 0;
                break;
            case 32: // space bar
                this.trailColor = "";
                break;
        }
    }

    draw() {
        //thrust the ship
        if (this.thrusting) {
            this.thrust.x += SHIP_THRUST * Math.cos(this.a);
            this.thrust.y += SHIP_THRUST * Math.sin(this.a);
    
            // draw the thruster
            this.ctx.fillStyle = "red";
            this.ctx.strokeStyle = "yellow";
            this.ctx.lineWidth = SHIP_SIZE / 10;
            this.ctx.beginPath();
            this.ctx.moveTo( // rear left
                this.x - this.r * (2 / 3 * Math.cos(this.a) + 0.5 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.5 * Math.cos(this.a))
            );
            this.ctx.lineTo( // rear centre (behind the ship)
                this.x - this.r * 5 / 3 * Math.cos(this.a),
                this.y + this.r * 5 / 3 * Math.sin(this.a)
            );
            this.ctx.lineTo( // rear right
                this.x - this.r * (2 / 3 * Math.cos(this.a) - 0.5 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.5 * Math.cos(this.a))
            );
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
    
        } else {
            this.thrust.x -= FRICTION * this.thrust.x / FPS;
            this.thrust.y -= FRICTION * this.thrust.y / FPS;
        }
    
    
        //draw a triangular ship
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = SHIP_SIZE / 20;
        this.ctx.beginPath();
        this.ctx.moveTo( //nose of the ship
            this.x + 4 / 3 * this.r * Math.cos(this.a),
            this.y - 4 / 3 * this.r * Math.sin(this.a)
        );
        this.ctx.lineTo( //rear left
            this.x - this.r * (2 / 3 * Math.cos(this.a) + Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) - Math.cos(this.a))
        );
        this.ctx.lineTo( //rear right
            this.x - this.r * (2 / 3 * Math.cos(this.a) - Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) + Math.cos(this.a))
        );
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.x += this.thrust.x / FPS;
        this.y -= this.thrust.y / FPS;

        // draw tron tail trail
        if (this.trailColor != "") {
            if (this.trail.length == 0 || this.trail[this.trail.length-1].x != this.x || this.trail[this.trail.length-1].y != this.y) {
                let point = {x: this.x, y:this.y};
                this.trail.push(point);
            } else {
                //console.log((this.x, this.y), " VS ", (this.trail[this.trail.length-1].x, this.trail[this.trail.length-1].y));
            }
        } else if (this.trail.length > 0 && (this.trail[this.trail.length-1].x != -1 || this.trail[this.trail.length-1].y != -1)) {
            let point = {x:-1, y:-1};
            this.trail.push(point);
        }

        this.ctx.strokeStyle = (this.trailColor != "") ? "white" : "grey";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        let pinch = true;
        this.trail.forEach(point => {
            if (point.x == -1 && point.y == -1) {
                pinch = true;
                this.ctx.stroke();
            } else if (pinch === true) {
                this.ctx.moveTo(point.x, point.y);
                pinch = false;
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        if (pinch === false)
            this.ctx.stroke();

        //rotate the ship
        this.a += this.rot;
    }
}


document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
setInterval(update, 1000/FPS); //call this update once every FPSth of a second
////////////////////////////

//let test = new Ship();

let numShips = 0;
let clrs = ["red", "blue", "purple", "orange"];
function randShip() {
    // generate a random ship, with the X and Y being randomly generated (random percent of the canvas width/height (0 to 100%))
    return new Ship('gameCanvas', Math.random()*canv.width, Math.random()*canv.height, SHIP_SIZE, Math.random()*359, clrs[numShips++]);
}

//                            CHANGE Array(100)
let army = Array.apply(0, Array(2)).map(
    function() {
        return randShip();
    }
);//[randShip(),randShip(),randShip(),randShip(),randShip(),randShip(),randShip(),randShip()];

////////////////////////////
function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canv.width,canv.height);
    //test.draw();
    army.forEach(guy => {
        guy.draw();
    });
}

function keyDown(ev) {
    //test.keyDown(ev);
    army.forEach(guy => {
        guy.keyDown(ev);
    });
}

function keyUp(ev) {
    //test.keyUp(ev);
    army.forEach(guy => {
        guy.keyUp(ev);
    });
}
