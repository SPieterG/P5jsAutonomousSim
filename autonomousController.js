let SkidpadStage = {
    STARTING: 0,
    FINISH: 5,
    STOPPING: 6
  };
  
  class AutonomousController {
    constructor(newcar, targetSpeed, newLookaheadDistance, newSteeringGain, newDGain, newDelayCompensation) {
      this.controlledCar = newcar;
      this.stearingAngle = 0;
      this.force = 0;
      this.stage = SkidpadStage.STARTING;
      this.progress = 0;
      this.speedTarget = targetSpeed;
      this.lookaheadDistance = newLookaheadDistance;
      this.steeringGain = newSteeringGain;
      this.dGain = newDGain;
      this.delayCompensation = newDelayCompensation;
  
      this.veltot = 0;
      this.worldAngle = 0;
      this.path = this.getSkidpadPath();
      this.pathPosition = 0;
      this.lookaheadpoint = createVector(0, 0);
      this.deviationFromPath = 0;
      this.expectedCarPos = createVector(0, 0);
      this.deviationIntegral = 0;

      this.oldSteeringP = 0;

      this.drawController = false;
    }

    reset(){
      this.stage = SkidpadStage.STARTING;
      this.progress = 0;
      this.pathPosition = 0;
      this.deviationFromPath = 0;
      this.deviationIntegral = 0;
      this.oldSteeringP = 0;
      this.lookaheadpoint = createVector(0, 0);
      this.expectedCarPos = createVector(0, 0);

    }
  
    update(dt) {
      this.veltot = this.controlledCar.velocity.x;
      this.worldAngle = this.controlledCar.heading.heading() - PI / 2;
      if (this.worldAngle < 0) {
        this.worldAngle += 2 * PI;
      }
  
      this.updateStateProgress(dt);
  
      // Go to traget speed during skidpad with fuzzy logic
      if (this.stage !== SkidpadStage.STOPPING && this.stage !== SkidpadStage.FINISH) {
        if (this.veltot > this.speedTarget + 0.2)
          this.force = -100;
        else if (this.veltot < this.speedTarget)
          this.force = 3080;
        else
          this.force = 0;
      } else {
        this.force = -3080;
      }
  
      this.expectedCarPos = this.controlledCar.pos.copy();
      let carV = this.controlledCar.heading.copy();
      carV.mult(this.delayCompensation * this.controlledCar.velocity.x);
      this.expectedCarPos.add(carV);
  
      this.lookaheadpoint = this.calculateLookaheadPoint(this.lookaheadDistance);
      let lookaheaddriection = this.lookaheadpoint.copy().sub(this.expectedCarPos);
      let steeringP = -lookaheaddriection.cross(this.controlledCar.heading).z * this.steeringGain;
      let d = max(min((steeringP - this.oldSteeringP) / dt, 0.2), -0.2);
      this.oldSteeringP = steeringP;

      this.stearingAngle = (steeringP + d * this.dGain) / (this.veltot + 1);
      this.stearingAngle = min(max(this.stearingAngle, -this.controlledCar.maxStearingAngle), this.controlledCar.maxStearingAngle);
  
      this.controlledCar.setSetpoints(this.stearingAngle, this.force);
    }
  
    draw() {
      if(!this.drawController)
        return;

      noStroke();
      fill(250, 0, 0);
      circle(wm.tX(this.lookaheadpoint.x), wm.tY(this.lookaheadpoint.y), 30);
      fill(0, 0, 250);
      circle(wm.tX(this.expectedCarPos.x), wm.tY(this.expectedCarPos.y), 20);
  
      for (let i = 0; i < this.path.length; i++) {
        let p = this.path[i];
        if (this.pathPosition > i)
          fill(0, 250, 0);
        else
          fill(250, 100, 0);
        circle(wm.tX(p.x), wm.tY(p.y), 5);
      }
  
      noFill();
      stroke(0);
      beginShape();
      for (let i = 0; i < this.path.length; i++) {
        let p = this.path[i];
        vertex(wm.tX(p.x), wm.tY(p.y));
      }
      endShape();
    }
  
    calculateLookaheadPoint(lookAheadDist) {
      let currentPoint = this.path[this.pathPosition];
      let nextPoint = this.path[this.pathPosition + 1];
      let lineDirection = p5.Vector.sub(currentPoint, nextPoint);
      let pointToLineStart = p5.Vector.sub(this.expectedCarPos, currentPoint);
      let totalDist = pointToLineStart.dot(lineDirection) / lineDirection.mag();

  
      for (let i = this.pathPosition; i < this.path.length - 1; i++) {

        let point1 = this.path[i];
        let point2 = this.path[i + 1];
        let dist = point1.dist(point2);
  
        if (totalDist + dist > lookAheadDist) {

          let factor = (lookAheadDist - totalDist) / dist;
          return p5.Vector.lerp(point1, point2, factor);
        }
  
        totalDist += dist;
      }
  
      return this.path[this.path.length - 1];
    }
  
    updateStateProgress(dt = 1/100) {
      for (let i = this.pathPosition; i < this.path.length - 1; i++) {
        let currentPoint = this.path[i];
        let nextPoint = this.path[i + 1];
        let lineDirection = p5.Vector.sub(nextPoint, currentPoint);
        let pointToLineStart = p5.Vector.sub(this.expectedCarPos, currentPoint);
        let t = pointToLineStart.dot(lineDirection) / lineDirection.mag();

                                                                                                            // correction factor as the car will also be steering a bit, should work out the actual trig but by that point we might as well implement mpc
        this.deviationFromPath = pointToLineStart.dot(lineDirection.rotate(PI / 2)) / lineDirection.magSq() + this.controlledCar.stearingAngle * this.veltot * dt * 10;
  
        if (t < 0) {
          this.pathPosition = i;
          break;
        }
      }
  
      this.progress = this.pathPosition / this.path.length;
  
      if (this.stage == SkidpadStage.STARTING && this.pathPosition + 60 >= this.path.length)
        this.stage = SkidpadStage.STOPPING;

      if(this.stage == SkidpadStage.STOPPING && this.veltot < 0.1)
        this.stage = SkidpadStage.FINISH;
    }
  
    getSkidpadPath(skdipadRadius = 9.125) {
      let path = [];
      
      let spCenterY = 15;

      let pathStep = 0.3;
  
      for (let i = 0; i < 15; i+=pathStep) {
        path.push(createVector(0, i));
      }
  
      for (let i = 0; i < 4 * PI; i += pathStep * 2 * PI / 57.33) {
        path.push(createVector(skdipadRadius - cos(i) * skdipadRadius, spCenterY + sin(i) * skdipadRadius));
      }
  
      for (let i = 0; i < 4 * PI; i += pathStep * 2 * PI / 57.33) {
        path.push(createVector(-skdipadRadius + cos(i) * skdipadRadius, spCenterY + sin(i) * skdipadRadius));
      }
  
      for (let i = 15; i < 40; i += pathStep) {
        path.push(createVector(0, i));
      }
  
      return path;
    }
  }