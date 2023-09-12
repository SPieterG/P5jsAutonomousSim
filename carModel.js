class Car {
    // State variables
    constructor(newSteeringDelay, carcolor = [0, 0, 0]) {
      this.acc = createVector();
      this.pos = createVector(0, 0);
      this.heading = p5.Vector.fromAngle(PI * 1.5 / 4 + 0.01);
      this.velocity = createVector(0, 0);
      this.gyro_z = 0;
  
      // Controlled values
      this.stearingAngleDelay = [];
      this.stearingAngle = 0; // Steering angle of the front wheels in rad
      this.force = 0;
  
      // Car parameters
      this.steeringDelaySteps = 80 * 100 / 1000;
      this.mass = 220;
      this.rotational_inertia;
      this.wheelbase = 1.53;
      this.carwidth = 1.25;
      this.CdA = 2;
      this.tireRadius = 0.179256;
      this.cog = 0.489; // cog percenage from the front (0 is all the way to the front, 1 all the way to the back)
      this.maxStearingAngle = 0;
      this.maxStearingAngleFull = 0.2;
      this.maxStearingAngleZero = 0.2;
  
      this.carcolor = carcolor;

      this.steeringDelaySteps = newSteeringDelay;
  
      this.positionHistory = [];

      for (let i = 0; i < this.steeringDelaySteps; i++) {
        this.stearingAngleDelay.push(this.stearingAngle);
      }
    }
  
    setSetpoints(newSteering, newForce) {
      if (this.steeringDelaySteps > 0)
        this.stearingAngleDelay[this.steeringDelaySteps - 1] = constrain(newSteering, -this.maxStearingAngle, this.maxStearingAngle);
      else
        this.stearingAngle = constrain(newSteering, -this.maxStearingAngle, this.maxStearingAngle);
      this.force = newForce;
    }
  
    update(dt) {

      this.maxStearingAngle = this.maxStearingAngleFull + this.maxStearingAngleZero * max(1 - this.velocity.x / 30, 0);

      if(this.positionHistory.length < 1 || this.positionHistory[this.positionHistory.length - 1].dist(this.pos) > 0.5)
        this.positionHistory.push(this.pos.copy());
  
      // Forward the steering delay
      if (this.steeringDelaySteps > 0) {
        this.stearingAngle = this.stearingAngleDelay[0];
        this.stearingAngleDelay.push(this.stearingAngleDelay[this.stearingAngleDelay.length - 1]);
        this.stearingAngleDelay.shift();
      }
  
      // Run bicycle model
      this.physicsBicicleModel(dt);
  
    }
  
    // getAcc - Returns a p5.Vector with the car acceleration in m/s^2 (no gravity vector, perfectly placed in the cog aligned with the floor)
    getAcc() {
      // Add noise in the future
      return this.acc.copy();
    }
  
    // getAcc - Returns a float with the car gyro z value in rad/sec
    getGyroZ() {
      // Add noise in the future
      return this.gyro_z;
    }
  
    physicsBicicleModel(dt) {
      // https://thomasfermi.github.io/Algorithms-for-Automated-Driving/Control/BicycleModel.html
      // https://youtu.be/HqNdBiej23I?si=-Sljz3YN4bCBNR8v

      if (this.velocity.x < 0.1 && this.force < 0)
        this.force = 0;

      this.acc.x = (this.force - this.velocity.x * this.velocity.x * this.CdA * 1.21 / 2 - this.velocity.x * 10) / this.mass;
      this.velocity.x += this.acc.x * dt;
  
      let sideslip = atan((1 - this.cog) * tan(this.stearingAngle));

      let dx = this.velocity.x * cos(this.heading.heading() + sideslip) * dt;
      let dy = this.velocity.x * sin(this.heading.heading() + sideslip) * dt;
      this.pos.x += dx;
      this.pos.y += dy;
      this.gyro_z = this.velocity.x * tan(this.stearingAngle) * cos(sideslip) / this.wheelbase;
      this.heading.rotate(this.gyro_z * dt);
    }
  
    draw() {
      this.drawHistory();
      this.drawCar();
    }
  
    drawHistory() {
      if (this.positionHistory.length < 2)
        return;

      stroke(this.carcolor[0], this.carcolor[1], this.carcolor[2]);
      strokeWeight(1);
      noFill();
      beginShape();
      for (let p of this.positionHistory) {
        vertex(wm.tX(p.x), wm.tY(p.y));
      }
      endShape();
    }

    drawCar() {
      // Draw COG dot
      noStroke();
      fill(250, 0, 0);
      circle(wm.tX(this.pos.x), wm.tY(this.pos.y), 15);
  
      stroke(2);
      strokeWeight(1);
  
      // Main line
      let fX = this.pos.x + this.heading.x * this.wheelbase * this.cog;
      let fY = this.pos.y + this.heading.y * this.wheelbase * this.cog;
      let rX = this.pos.x - this.heading.x * this.wheelbase * (1 - this.cog);
      let rY = this.pos.y - this.heading.y * this.wheelbase * (1 - this.cog);
      line(wm.tX(rX), wm.tY(rY), wm.tX(fX), wm.tY(fY));
  
      // Front axle
      let frX = fX + this.carwidth * this.heading.y * 0.5;
      let frY = fY - this.carwidth * this.heading.x * 0.5;
      let flX = fX - this.carwidth * this.heading.y * 0.5;
      let flY = fY + this.carwidth * this.heading.x * 0.5;
      line(wm.tX(flX), wm.tY(flY), wm.tX(frX), wm.tY(frY));
  
      // Rear axle
      let rrX = rX + this.carwidth * this.heading.y * 0.5;
      let rrY = rY - this.carwidth * this.heading.x * 0.5;
      let rlX = rX - this.carwidth * this.heading.y * 0.5;
      let rlY = rY + this.carwidth * this.heading.x * 0.5;
      line(wm.tX(rlX), wm.tY(rlY), wm.tX(rrX), wm.tY(rrY));
  
      // Front tires
      let frontTireHeading = this.heading.copy();
      frontTireHeading.rotate(this.stearingAngle);
  
      let flfX = flX + frontTireHeading.x * this.tireRadius;
      let flfY = flY + frontTireHeading.y * this.tireRadius;
      let flrX = flX - frontTireHeading.x * this.tireRadius;
      let flrY = flY - frontTireHeading.y * this.tireRadius;
      line(wm.tX(flfX), wm.tY(flfY), wm.tX(flrX), wm.tY(flrY));
  
      let frfX = frX + frontTireHeading.x * this.tireRadius;
      let frfY = frY + frontTireHeading.y * this.tireRadius;
      let frrX = frX - frontTireHeading.x * this.tireRadius;
      let frrY = frY - frontTireHeading.y * this.tireRadius;
      line(wm.tX(frfX), wm.tY(frfY), wm.tX(frrX), wm.tY(frrY));
  
      // Rear tires
      let rlfX = rlX + this.heading.x * this.tireRadius;
      let rlfY = rlY + this.heading.y * this.tireRadius;
      let rlrX = rlX - this.heading.x * this.tireRadius;
      let rlrY = rlY - this.heading.y * this.tireRadius;
      line(wm.tX(rlfX), wm.tY(rlfY), wm.tX(rlrX), wm.tY(rlrY));
  
      let rrfX = rrX + this.heading.x * this.tireRadius;
      let rrfY = rrY + this.heading.y * this.tireRadius;
      let rrrX = rrX - this.heading.x * this.tireRadius;
      let rrrY = rrY - this.heading.y * this.tireRadius;
      line(wm.tX(rrfX), wm.tY(rrfY), wm.tX(rrrX), wm.tY(rrrY));
    }

    keyPressed(e) {
      print(e);
    }
  }
  