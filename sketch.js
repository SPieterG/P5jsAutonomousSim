console.log("Welcome to the P5jsAutonomousSim!");
console.log("To perform ofline grid search run the following code in the console:");
console.log("optimizerGridSearch(carSteeringLatancyRange = [50], carspeedRange = [20], lookaheadDistanceRange = [2, 2.5, 3], steeringGainRange = [2, 3, 4], dGainRange = [0, 0.5, 1, 2, 5], stanlyCrosstrackGainRange = [0], stanlyHeadingGainRange = [0], stanly_KeRange = [1], stanly_KvRange = [1], delayCompensationRange = [50])");

function setup() {
  createCanvas(windowWidth, windowHeight);
  // frameRate(10);

  coneMap = createSkidpad();

  let car1 = new Car(50 * 100 / 1000, [50, 50, 250]);
  autonomousCars.push(new AutonomousCar(
    car1, new AutonomousController(car1, 12, 2, 0.2, 0, 0, 0, 1, 1, 0 / 1000)))

  let car2 = new Car(50 * 100 / 1000, [50, 200, 50]);
  autonomousCars.push(new AutonomousCar(
    car2, new AutonomousController(car2, 12, 2.5, 0.2, 0, 0, 0, 1, 1, 50 / 1000)))

  let car3 = new Car(50 * 100 / 1000, [250, 50, 50]);
  autonomousCars.push(new AutonomousCar(
    car3, new AutonomousController(car3, 12, 2.5, 0.2, 0, 0, 0, 1, 1, 100 / 1000)))
  
    
  let car4 = new Car(50 * 100 / 1000, [50, 50, 50]);
  autonomousCars.push(new AutonomousCar(
    car4, new AutonomousController(car4, 12, 2.5, 0, 0, 1, 2, 0.5, 0.5, 50 / 1000)))

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

      simulationTime += 1000.0 / 100 / simulationSpeed;
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