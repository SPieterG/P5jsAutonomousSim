let coneMap;
let skidpadPredictor;
let ui;
let wm;
let ap;
let autonomousCars = []

let simulating = true;

let scaleFactor = 1;

// Interface for classes that want to listen to mouse events
class MouseHandler {
  mousePressed() {}
  mouseReleased() {}
  mouseWheel(event) {}
}
let mouseListeners = [];

// Interface for classes that want to listen to keyboard events
class KeyHandler {
  keyPressed() {}
  keyReleased() {}
}
let keyListeners = [];


class AutonomousCar{
  constructor(car, controller) {
    this.car = car;
    this.controller = controller;
  }
  
  update(ts){
    this.car.update(ts);
    this.controller.update(ts);
  }

  draw(){
    this.car.draw();
    // this.controller.draw();
  }
}