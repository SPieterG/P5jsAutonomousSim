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


