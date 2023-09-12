console.log("Welcome to the P5jsAutonomousSim!");
console.log("To add more cars run:");
console.log("let myCar = new Car(SteeringDelayMS * 100 / 1000, colorRGB = [50, 50, 250]);");
console.log("autonomousCars.push(new AutonomousCar(myCar, new AutonomousController(myCar, Carspeed, LookaheadDistance, SteeringGain, DampingGain, SteeringDelayMS / 1000)))");

function setup() {
  createCanvas(windowWidth, windowHeight);
  // frameRate(10);

  coneMap = createSkidpad();

  let car1 = new Car(50 * 100 / 1000, [50, 50, 250]);
  autonomousCars.push(new AutonomousCar(
    car1, new AutonomousController(car1, 20, 2, 4, 0, 0 / 1000)))

  let car2 = new Car(50 * 100 / 1000, [50, 200, 50]);
  autonomousCars.push(new AutonomousCar(
    car2, new AutonomousController(car2, 20, 2.5, 4, 0, 50 / 1000)))

  let car3 = new Car(50 * 100 / 1000, [250, 50, 50]);
  autonomousCars.push(new AutonomousCar(
    car3, new AutonomousController(car3, 20, 2.5, 4, 0, 100 / 1000)))

  // // Uncomment to add manual car
  // let car4 = new Car(100 * 120 / 1000, [100, 100, 100]);
  // autonomousCars.push(new AutonomousCar(
  //   car4, new ManualController(car4)))

  // ap = new AutonmousPerception(car);
  wm = new WorldManager();
  ui = new UI();
}

let simulationTime = 0;


function draw() {
  background(255);


  if (simulating) {
    let current_time = millis();
    while(simulationTime < current_time){

      for (let c of autonomousCars) {
        c.update(1.0 / 100);
      }

      simulationTime += 1000.0 / 100;
      ui.update();
    }
  } else {
    simulationTime = millis();
  }
  wm.update();

  wm.draw();

  for (let c of autonomousCars) {
    c.draw();
  }

  coneMap.draw();

  ui.draw();
}

function keyPressed() {
  for (let kh of keyListeners)
    kh.keyPressed();
}

function keyReleased() {
  for (let kh of keyListeners)
    kh.keyReleased();
}

function mousePressed() {
  // simulating = !simulating;

  for (let mh of mouseListeners)
    mh.mousePressed();
}

function mouseReleased() {
  for (let mh of mouseListeners)
    mh.mouseReleased();
}

function mouseWheel(event) {
  for (let mh of mouseListeners)
    mh.mouseWheel(event);
}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}