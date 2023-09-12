class WorldManager {
    constructor() {
      // scaling variables
      this.sfx = 20;
      this.sfy = -20;
      this.osx = 21;
      this.osy = -12;

      this.lastAverage = [0, 0]
  
      // options
      this.drawGrid = true;
      this.drawCoordinates = false;
  
      mouseListeners.push(this);
    }
  
    tX(x_worldspace) {
      return (x_worldspace + this.osx) * this.sfx;
    }
  
    tY(y_worldspace) {
      return (y_worldspace + this.osy) * this.sfy;
    }
  
    rX(x_screenspace) {
      return x_screenspace / this.sfx - this.osx;
    }
  
    rY(y_screenspace) {
      return y_screenspace / this.sfy - this.osy;
    }

    scaleW2S(sceenspace){
      return sceenspace * this.sfx;
    }

    
    scaleS2W(sceenspace){
      if(this.sfx == 0)
        return 0;

      return sceenspace / this.sfx;
    }
  
    update() {
      if (mouseIsPressed) {
        this.osx += (mouseX - pmouseX) / this.sfx;
        this.osy += (mouseY - pmouseY) / this.sfy;
      }

      if(autonomousCars.length > 0){
        let average = [0, 0];
        for(let c of autonomousCars){
          average[0] += c.car.pos.x;
          average[1] += c.car.pos.y;
        }
        average[0] /= autonomousCars.length;
        average[1] /= autonomousCars.length;

        this.osx -= (average[0] - this.lastAverage[0]);
        this.osy -= (average[1] - this.lastAverage[1]);

        this.lastAverage = average;
      }
    }
  
    draw() {
      if (!this.drawGrid) return;
  
      const gridStartX = floor(this.rX(0));
      const gridStartY = floor(this.rY(ui.graphSplit));
      const gridEndX = floor(this.rX(width) + 1);
      const gridEndY = floor(this.rY(0) + 1);
  
      strokeWeight(1);
  
      if (this.drawCoordinates) {
        textSize(12);
        stroke(100);
        text("(0, 0)", this.tX(0.2), this.tY(0.2));
      }
  
      for (let x = gridStartX + 1; x < gridEndX; x++) {
        if (x === 0) {
          stroke(0, 250, 0);
        } else if (x % 10 === 0) {
          stroke(100);
          if (this.drawCoordinates) text(`(${x}, 0)`, this.tX(x), this.tY(0.2));
        } else {
          stroke(220);
        }
        line(this.tX(x), this.tY(gridStartY), this.tX(x), this.tY(gridEndY));
      }
  
      for (let y = gridStartY + 1; y < gridEndY; y++) {
        if (y === 0) {
          stroke(250, 0, 0);
        } else if (y % 10 === 0) {
          stroke(100);
          if (this.drawCoordinates) text(`(0, ${y})`, this.tX(0.2), this.tY(y));
        } else {
          stroke(220);
        }
        line(this.tX(gridStartX), this.tY(y), this.tX(gridEndX), this.tY(y));
      }
    }
  
    mousePressed() {}
  
    mouseReleased() {}
  
    mouseWheel(event) {
      if(mouseY > ui.graphSplit || (mouseX < ui.controlPanelSplit && ui.controlPanel.show))
        return;

      const zoomSpeed = 0.0005;
      const startx = this.rX(mouseX);
      const starty = this.rY(mouseY);
  
      this.sfy += event.delta * this.sfx * zoomSpeed;
      this.sfx -= event.delta * this.sfx * zoomSpeed;
  
      this.osx -= startx - this.rX(mouseX);
      this.osy -= starty - this.rY(mouseY);
    }
  }
  