const PI = Math.PI;
function degreesToRadian(d) {
    return d*PI/180;
}
class Circle {
    constructor(r) {
        this.r = r;
        area() {
            return PI*this.r*this.r;
        }
    }
}

export {Circle, degreesToRadian, PI};
