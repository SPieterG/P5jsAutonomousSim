let SkidpadStage = {
    STARTING: 0,
    FINISH: 5,
    STOPPING: 6
  };
  
  class AutonomousController {
    constructor(newcar, targetSpeed, newLookaheadDistance, newSteeringGain, newDGain, stanlyCrosstrackGain, stanlyHeadingGain, stanly_Ke, stanly_Kv, newDelayCompensation) {
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

      this.stanlyCrosstrackGain = stanlyCrosstrackGain;
      this.stanlyHeadingGain = stanlyHeadingGain;
      this.stanly_Ke = stanly_Ke;
      this.stanly_Kv = stanly_Kv;
  
      this.veltot = 0;
      this.worldAngle = 0;
      this.path = this.getSkidpadPath();
      this.pathPosition = 0;
      this.lookaheadpoint = createVector(0, 0);

      this.deviationFromPath = 0;  // Distance from the path to the (expected) car cog
      this.crossTrackError = 0; // Distance from the path to the (expected) front axcel

      this.headingError = 0;
      this.yaw_diff_crosstrack = 0;

      this.expectedCarPos = createVector(0, 0);
      this.expectedFrontAxcelPos = createVector(0, 0);
      this.expectedHeading = createVector(0, 1);


      this.deviationIntegral = 0;

      this.pathPoint = createVector(0, 0);
      this.frontAxcelPathPoint = createVector(0, 0);
      this.frontAxcelPathHeading = createVector(0, 0);

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
      this.pathPoint = createVector(0, 0);
      this.expectedCarPos = createVector(0, 0);
      this.expectedFrontAxcelPos = createVector(0, 0);
      this.expectedHeading = createVector(0, 1);
    }
  
  update(dt) {
    this.veltot = this.controlledCar.velocity.x;
    this.worldAngle = this.controlledCar.heading.heading() - PI / 2;
    if (this.worldAngle < 0) {
      this.worldAngle += 2 * PI;
    }

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


    this.calculateExpectedCarPos(dt); // this.expectedCarPos
    this.updateStateProgress(dt); // this.pathPosition, this.progress, this.deviationFromPath, this.pathPoint, this.stage

    this.lookaheadpoint = this.calculateLookaheadPoint(this.lookaheadDistance);
    let lookaheaddriection = this.lookaheadpoint.copy().sub(this.expectedCarPos);

    // Proportional steering: angle between the car heading and the heading to the lookahead point (A poor mans Pure Pursuit)
    let steeringProportional = -lookaheaddriection.cross(this.controlledCar.heading).z * this.steeringGain;
    
    // Stanly controller
    // http://robots.stanford.edu/papers/thrun.stanley05.pdf
    // https://github.com/DongChen06/PathTrackingBicycle/blob/master/controller2d.py

    // Stanly controller front axcel heading error
    this.headingError = transform_angle(this.frontAxcelPathHeading.heading() - this.expectedHeading.heading());
    
    // Stanly controller cross track error term
    this.yaw_diff_crosstrack = atan(this.stanly_Ke * this.crossTrackError / (this.stanly_Kv + this.veltot));

    let d = max(min((steeringProportional - this.oldSteeringP) / dt, 0.2), -0.2);
    this.oldSteeringP = steeringProportional;

    this.stearingAngle = steeringProportional 
      + d * this.dGain 
      + this.stanlyCrosstrackGain * this.yaw_diff_crosstrack 
      + this.stanlyHeadingGain * this.headingError;
      
    this.stearingAngle = min(max(this.stearingAngle, -this.controlledCar.maxStearingAngle), this.controlledCar.maxStearingAngle);

    this.controlledCar.setSetpoints(this.stearingAngle, this.force);
  }


  
   /**
   * Uses:
   * - this.delayCompensation set by user
   * - current position
   * - current heading
   * - current velocity
   * - (current steering)
   * Calculates:
   * - this.expectedCarPos
   * - this.expectedHeading
   * - this.expectedFrontAxcelPos
   */
    calculateExpectedCarPos(dt){
      let localX = 0;
      let localY = 0;
      // Turning radius
      let R = 1 / (tan(this.controlledCar.stearingAngle) * cos(this.controlledCar.sideslip) / this.controlledCar.wheelbase);
      
      if(this.drawController){
        fill(50, 50, 50);
        circle(wm.tX(this.controlledCar.pos.x), wm.tY(this.controlledCar.pos.y), 10);

        for(let i = 1; i < 10; i++){
          let dist = this.controlledCar.velocity.x * this.delayCompensation * i;
          if(Math.abs(R) < 0.0001)
            R = 0.0001;
          let theta = dist / R;
          
          localX = R * sin(theta);
          localY = R * (1 - cos(theta));
    
          this.expectedCarPos = this.controlledCar.pos.copy();
          let ofset = createVector(localX, localY);
          ofset.rotate(this.controlledCar.heading.heading() + this.controlledCar.sideslip);
          this.expectedCarPos.add(ofset)

          fill(150, 50, 50);
          circle(wm.tX(this.expectedCarPos.x), wm.tY(this.expectedCarPos.y), 10);
        }
      }

      // Distance traveled
      let dist = this.controlledCar.velocity.x * this.delayCompensation;
      if(Math.abs(R) < 0.0001)
        R = 0.0001;

      // Angle traveled
      let theta = dist / R;
      
      // Travled distance in local coordinates
      localX = R * sin(theta);
      localY = R * (1 - cos(theta));

      // Expected car position
      this.expectedCarPos = this.controlledCar.pos.copy();
      let ofset = createVector(localX, localY);
      ofset.rotate(this.controlledCar.heading.heading() + this.controlledCar.sideslip);
      this.expectedCarPos.add(ofset)

      // Expected heading
      this.expectedHeading = this.controlledCar.heading.copy();
      this.expectedHeading.rotate(theta);

      // Expected front axcel position
      this.expectedFrontAxcelPos = this.expectedCarPos.copy();
      let heading = this.expectedHeading.copy();
      this.expectedFrontAxcelPos.add(heading.mult(this.controlledCar.wheelbase * this.controlledCar.cog));

      /* Expected car position without steering */
      // this.expectedCarPos = this.controlledCar.pos.copy();
      // let carV = this.controlledCar.heading.copy();
      // carV.mult(this.delayCompensation * this.controlledCar.velocity.x);
      // this.expectedCarPos.add(carV);
    }

    /**
     * Uses:
     * - lookaheadDistance (method argument)
     * - this.path
     * - this.pathPosition
     * - this.expectedCarPos
     * Returns:
     * - lookaheadpoint
     */
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
  
    /**
     * Uses:
     * - this.path
     * - this.expectedCarPos
     * Calculates:
     * - this.pathPosition
     * - this.progress
     * - this.deviationFromPath
     * - this.pathPoint
     * - this.stage
     * - this.crossTrackError
     */
    updateStateProgress(dt = 1/100) {
      // Determin the point on the path closest to the (expected) car cog
      for (let i = this.pathPosition; i < this.path.length - 1; i++) {
        let currentPoint = this.path[i];
        let nextPoint = this.path[i + 1];
        let lineDirection = p5.Vector.sub(nextPoint, currentPoint);
        let pointToLineStart = p5.Vector.sub(this.expectedCarPos, currentPoint);
        let t = pointToLineStart.dot(lineDirection) / lineDirection.mag();

        this.pathPoint = currentPoint.copy();
        this.pathPoint.add(lineDirection.mult(t / lineDirection.mag()));

        this.deviationFromPath = this.pathPoint.dist(this.expectedCarPos) * Math.sign(pointToLineStart.dot(lineDirection.rotate(PI / 2)))

        if (t < 0) {
          this.pathPosition = i;
          break;
        }
      }

      // Determin the point on the path closest to the front axcel and calculate the cross track error
      for (let i = this.pathPosition; i < this.path.length - 1; i++) {
        let currentPoint = this.path[i];
        let nextPoint = this.path[i + 1];
        let lineDirection = p5.Vector.sub(nextPoint, currentPoint);
        let pointToLineStart = p5.Vector.sub(this.expectedFrontAxcelPos, currentPoint);
        let t = pointToLineStart.dot(lineDirection) / lineDirection.mag();

        this.frontAxcelPathPoint = currentPoint.copy();
        this.frontAxcelPathPoint.add(lineDirection.mult(t / lineDirection.mag()));

        this.frontAxcelPathHeading = lineDirection.copy();
        this.frontAxcelPathHeading.normalize();
        this.frontAxcelPathHeading.rotate(PI);

        this.crossTrackError = this.frontAxcelPathPoint.dist(this.expectedFrontAxcelPos) * Math.sign(pointToLineStart.dot(lineDirection.rotate(PI / 2)))

        if (t < 0) {
          break;
        }
      }


  
      this.progress = this.pathPosition / this.path.length;
  
      if (this.stage == SkidpadStage.STARTING && this.pathPosition + 60 >= this.path.length)
        this.stage = SkidpadStage.STOPPING;

      if(this.stage == SkidpadStage.STOPPING && this.veltot < 0.1)
        this.stage = SkidpadStage.FINISH;
    }
  
    /** Draw everything related to visualizing the path */
    draw() {
      if(!this.drawController)
        return;

      noStroke();
      fill(250, 0, 0);
      circle(wm.tX(this.lookaheadpoint.x), wm.tY(this.lookaheadpoint.y), 30);
      fill(0, 0, 250);
      circle(wm.tX(this.expectedCarPos.x), wm.tY(this.expectedCarPos.y), 20);
      fill(100, 100, 250);
      circle(wm.tX(this.expectedFrontAxcelPos.x), wm.tY(this.expectedFrontAxcelPos.y), 15);

      fill(0, 250, 0);
      // circle(wm.tX(this.path[this.pathPosition].x), wm.tY(this.path[this.pathPosition].y), 20);
      circle(wm.tX(this.pathPoint.x), wm.tY(this.pathPoint.y), 20);
      circle(wm.tX(this.frontAxcelPathPoint.x), wm.tY(this.frontAxcelPathPoint.y), 20);

      noFill();
      stroke(0);
      circle(wm.tX(this.pathPoint.x), wm.tY(this.pathPoint.y), 2 * wm.scaleW2S(this.deviationFromPath));
      circle(wm.tX(this.frontAxcelPathPoint.x), wm.tY(this.frontAxcelPathPoint.y), 2 * wm.scaleW2S(this.crossTrackError));


      noStroke();
      fill(250, 50, 250);
      circle(wm.tX(this.path[this.pathPosition].x), wm.tY(this.path[this.pathPosition].y), 10);
      circle(wm.tX(this.path[this.pathPosition + 1].x), wm.tY(this.path[this.pathPosition + 1].y), 10);


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

    /**
     * Returns the path of the skidpad
     * @param { Number } skdipadRadius
     * @returns { Array } Array of p5.Vector with the path of the skidpad
     */
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

  function transform_angle(angle){
    if(angle > PI)
      angle -= 2 * PI;
    else if(angle < -PI)
      angle += 2 * PI;
    return angle;
  }