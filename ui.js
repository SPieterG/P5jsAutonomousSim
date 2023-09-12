// Please don't look at this code, its messy with drawing order, mouse interaction and updates all over the place. but it works :D

class UI {
  constructor() {
    this.historySize = 2000;
    this.graphSplit = 500;
    this.controlPanelSplit = 400;

    this.graphs = [
      new Figure(this.historySize, 'controller', 'deviationFromPath', 0),
      new Figure(this.historySize, 'controller', 'stearingAngle', 1),
    ]

    this.controlPanel = new ControlPanel();

    this.showGraphs = true;

    mouseListeners.push(this);
  }

  update() {
    for(let graph of this.graphs){
      graph.update();
    }
  }

  draw() {
    textSize(28);
    noStroke();
    fill(0);
    text(frameRate().toFixed(1) + "fps", width - 100, 40);

    textSize(12);
    text(wm.rX(mouseX), mouseX, mouseY + 30);
    text(wm.rY(mouseY), mouseX, mouseY + 50);

    if(this.showGraphs){
      fill(255);
      strokeWeight(1);
      stroke(0);
      rect(1, this.graphSplit + 1, width / 2 - 1, height - 1);
      rect(width / 2 - 1, this.graphSplit + 1, width - 1, height - 1);

      for(let graph of this.graphs){
        graph.draw();
      }
    }

    this.controlPanel.draw();
  }

  
  mousePressed() {
    if(mouseX < ui.controlPanelSplit){
      this.controlPanel.mousePressed();
    }
  }

  mouseReleased() {}

  mouseWheel(event) {
    if(mouseX < ui.controlPanelSplit){
      this.controlPanel.scrollDist += event.delta;
      this.controlPanel.scrollDist = Math.max(0, Math.min(this.controlPanel.scrollDist, this.controlPanel.height - height));
    }
  }
}
  



class Figure{

  constructor(historySize = 3000, graphObject, graphKey, figure){
    this.historySize = historySize;
    this.graphHistories = [
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0)
    ]
    this.graphObject = graphObject;
    this.graphKey = graphKey;
    this.figure = figure;
  }

  update() {
    if(this.graphObject != ''){
      let i = 0;
      for (let c of autonomousCars) {
        this.graphHistories[i].push(c[this.graphObject][this.graphKey]);
        this.graphHistories[i].shift();
        i++;
        if(i >= this.graphHistories.length)
          break;
      }
    }
  }

  setValue(graphObject, graphKey){
    if(graphObject == this.graphObject && graphKey == this.graphKey)
      return;

    this.graphObject = graphObject;
    this.graphKey = graphKey;

    this.graphHistories = [
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0),
      Array(this.historySize).fill(0)
    ]
  }

  draw() {
    let min2 = Infinity;
    let max2 = -Infinity;
    for(let history of this.graphHistories){
      min2 = Math.min(history.reduce((a, b) => Math.min(a, b), Infinity), min2);
      max2 = Math.max(history.reduce((a, b) => Math.max(a, b), -Infinity), max2);
    }
    for(let i = 0; i < this.graphHistories.length; i++){
      this.drawDataFig(this.graphKey + " car" + (i+1), this.graphHistories[i], i + 1, min2, max2);
    }
  }

  drawDataFig(title, data, col, min, max) {
    let fillColor;
    switch (col) {
      case 0:
        fillColor = color(0);
        break;
      case 1:
        fillColor = color(50, 50, 250);
        break;
      case 2:
        fillColor = color(50, 200, 50);
        break;
      case 3:
        fillColor = color(250, 50, 50);
        break;
      default:
        fillColor = color(100, 100, 100);
        break;
    }
    
    noStroke();
    fill(fillColor);
    text(title, this.figure ? 20 : width / 2 + 20, ui.graphSplit + 20 + 10 * col);

    let dataMin = data.reduce((a, b) => Math.min(a, b), Infinity);
    let dataMax = data.reduce((a, b) => Math.max(a, b), -Infinity);

    text(dataMax.toFixed(2), this.figure ? width / 2 - 40 : width - 40, ui.graphSplit + 20 + 10 * col);
    text(dataMin.toFixed(2), this.figure ? width / 2 - 40 : width - 40, height - 10 - 10 * col);

    noFill();
    strokeWeight(1);

    stroke(fillColor);
    beginShape();
    for (let i = 0; i < data.length; i++) {
      let x = map(i, 0, data.length, this.figure ? 1 : width / 2 + 1, this.figure ? width / 2 - 1 : width - 1);
      let y = map(data[i], min, max, height - 10, ui.graphSplit + 10);

      vertex(x, y);
    }
    endShape();
  }

}


class ControlPanel{

  constructor(){
    this.show = true;

    this.mousePressedThisFrame = false;

    this.scrollDist = 0;

    this.carVisibilities = [];
    for(let i = 0; i < autonomousCars.length; i++){
      this.carVisibilities.push(false);
    }

    this.height = height;
  }

  draw(){

    if(this.show){
      fill(255, 255, 255, 200);
      rect(0, 0, ui.controlPanelSplit, height);
  
  
      let y = 100 - this.scrollDist;
      y = this.drawPauseButton(y);
      y = this.drawCarValues(y);
  
      this.height = y + this.scrollDist + 100;
    }

    this.drawHeader();



    this.mousePressedThisFrame = false;
  }

  mousePressed(){
    this.mousePressedThisFrame = true;
  }

  drawHeader(){
    if(!this.show){
      fill(255, 255, 255, 150);
      stroke(0, 0, 0, 200);
    }else{
      fill(255);
      stroke(0);
    }

    rect(0, 0, ui.controlPanelSplit, 60);

    textSize(28);
    noStroke();
    fill(0);
    text("Control Panel", 40, 40);

    if(this.mousePressedThisFrame && mouseIntersectsRect(ui.controlPanelSplit - 40, 0, 40, 40))
      this.show = !this.show;

    if(!this.show){
      text("V", ui.controlPanelSplit - 40, 40);
    } else{
      text(char(581), ui.controlPanelSplit - 40, 40);
    }
  }

  drawPauseButton(y){

    // Pause button
    if(this.mousePressedThisFrame && mouseIntersectsRect(40, y, 100, 20))
      simulating = !simulating;

    if(simulating){
      fill(0, 255, 0);
      rect(40, y, 100, 20);

      fill(0);
      noStroke();
      text("Pause", 70, y + 15)
    } else{
      fill(255, 0, 0);
      rect(40, y, 100, 20);

      fill(255);
      noStroke();
      text("Play", 70, y + 15)
    }



    return y + 40;
  }

  drawCarValues(y){
    noStroke();

    let i = 1;
    for(let car of autonomousCars){
      textSize(20);
      y += 20;
      fill(car.car.carcolor[0], car.car.carcolor[1], car.car.carcolor[2]);
      text("Car " + i + " :  " + car.controller.veltot.toFixed(2) + " [m/s]  " + (car.controller.progress * 100).toFixed(2) + "%", 40, y);
      i++;
      y += 20;

      // Visibility toggle
      if(this.mousePressedThisFrame && mouseX < ui.controlPanelSplit && mouseX > 0 && mouseY > y - 40 && mouseY < y - 20){
        this.carVisibilities[i-2] = !this.carVisibilities[i-2];
      }
      if(!this.carVisibilities[i-2]){
        text("V", ui.controlPanelSplit - 40, y - 20);
        continue;
      } else{
        text(char(581), ui.controlPanelSplit - 40, y - 20);
      }

      fill(0);

      y += 5;
      textSize(18);
      text("Car values:", 40, y);
      y += 20;
      
      textSize(12);
      let carKeys = Object.keys(autonomousCars[0].car)
      for(let key of carKeys){
        if(typeof car.car[key] == "number"){
          text(key + ": " + car.car[key].toFixed(2), 40, y);

          if(this.mousePressedThisFrame && mouseIntersectsRect(ui.controlPanelSplit - 40, y - 5, 10, 10))
            ui.graphs[0].setValue('car', key)
          stroke(0);
          if(ui.graphs[0].graphObject == 'car' && ui.graphs[0].graphKey == key)
            fill(50, 50, 250);
          else
            noFill();
          rect(ui.controlPanelSplit - 40, y - 5, 10, 10);

          if(this.mousePressedThisFrame && mouseIntersectsRect(ui.controlPanelSplit - 70, y - 5, 10, 10))
            ui.graphs[1].setValue('car', key)

          if(ui.graphs[1].graphObject == 'car' && ui.graphs[1].graphKey == key)
            fill(50, 50, 250);
          else
            noFill();
          rect(ui.controlPanelSplit - 70, y - 5, 10, 10);

          noStroke();
          fill(0);
          y += 20;
        }
      }


      y += 5;
      textSize(18);
      text("Controller values:", 40, y);  
      y += 20;

      textSize(12);
      let controllerKeys = Object.keys(autonomousCars[0].controller)
      for(let key of controllerKeys){
        if(typeof car.controller[key] == "number"){
          text(key + ": " + car.controller[key].toFixed(2), 40, y);

          if(this.mousePressedThisFrame && mouseIntersectsRect(ui.controlPanelSplit - 40, y - 5, 10, 10))
            ui.graphs[0].setValue('controller', key)
          stroke(0);
          if(ui.graphs[0].graphObject == 'controller' && ui.graphs[0].graphKey == key)
            fill(50, 50, 250);
          else
            noFill();
          rect(ui.controlPanelSplit - 40, y - 5, 10, 10);

          if(this.mousePressedThisFrame && mouseIntersectsRect(ui.controlPanelSplit - 70, y - 5, 10, 10))
            ui.graphs[1].setValue('controller', key)
          if(ui.graphs[1].graphObject == 'controller' && ui.graphs[1].graphKey == key)
            fill(50, 50, 250);
          else
            noFill();
          rect(ui.controlPanelSplit - 70, y - 5, 10, 10);

          noStroke();
          fill(0);

          y += 20;
        }
      }


    }

    return y;
  }
}

function mouseIntersectsRect(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}