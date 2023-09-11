class ManualController {
    constructor(newcar) {
      this.car = newcar;
      this.instantAngle = 0;
      this.stearingAngle = 0;
      this.steeringFilterFrequency = 10;

      this.force = 0;

      this.upPressed = false;
      this.downPressed = false;
      this.leftPressed = false;
      this.rightPressed = false;
      keyListeners.push(this);
    }
  
    update(dt) {
      if (this.downPressed) {
        this.force = -3080;
      } else if (this.upPressed) {
        this.force = 3080;
      } else {
        this.force = 0;
      }
  
      // Steering code
      if (this.leftPressed) {
        this.instantAngle += 5 * dt;
        if (this.instantAngle > this.car.maxStearingAngle) {
          this.instantAngle = this.car.maxStearingAngle;
        }
      } else if (this.rightPressed) {
        this.instantAngle -= 5 * dt;
        if (this.instantAngle < -this.car.maxStearingAngle) {
          this.instantAngle = -this.car.maxStearingAngle;
        }
      } else {
        this.instantAngle = this.instantAngle - this.instantAngle * 2 * dt;
      }

      let a = dt * 2 * PI * this.steeringFilterFrequency;
      this.stearingAngle = (1 - a) * this.stearingAngle + a * this.instantAngle;

      // mouse control:
      // this.stearingAngle = - mouseX / width * 2  * this.car.maxStearingAngle + this.car.maxStearingAngle;
  
      this.car.setSetpoints(this.stearingAngle, this.force);
    }
  
    draw() {}

    keyPressed() {
      if (keyIsPressed) {
        if (keyCode === UP_ARROW) {
          this.upPressed = true;
        } else if (keyCode === DOWN_ARROW) {
          this.downPressed = true;
        } else if (keyCode === LEFT_ARROW) {
          this.leftPressed = true;
        } else if (keyCode === RIGHT_ARROW) {
          this.rightPressed = true;
        }
      }
    }
  
    keyReleased() {
      if (keyCode === UP_ARROW) {
        this.upPressed = false;
      } else if (keyCode === DOWN_ARROW) {
        this.downPressed = false;
      } else if (keyCode === LEFT_ARROW) {
        this.leftPressed = false;
      } else if (keyCode === RIGHT_ARROW) {
        this.rightPressed = false;
      }
    }
    
  }
  