class UI {
  constructor() {
    this.historySize = 3000;
    this.graphSplit = 500;

    // this.graph1Histories = [
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0)
    // ]
    // this.graph1object = 'controller';
    // this.graph1key = 'deviationFromPath'


    // this.graph2Histories = [
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0),
    //   Array(this.historySize).fill(0)
    // ]
    // this.graph2object = 'controller';
    // this.graph2key = 'stearingAngle'

    this.graphs = [
      new Figure(this.historySize, 'controller', 'deviationFromPath', 0),
      new Figure(this.historySize, 'controller', 'stearingAngle', 1),
    ]

    this.showGraphs = true;
  }

  update() {
    // if(this.graph1object != ''){
    //   let i = 0;
    //   for (let c of autonomousCars) {
    //     this.graph1Histories[i].push(c[this.graph1object][this.graph1key]);
    //     this.graph1Histories[i].shift();
    //     i++;
    //     if(i >= this.graph1Histories.length)
    //       break;
    //   }
    // }

    // if(this.graph2object != ''){
    //   let i = 0;
    //   for (let c of autonomousCars) {
    //     this.graph2Histories[i].push(c[this.graph2object][this.graph2key]);
    //     this.graph2Histories[i].shift();
    //     i++;
    //     if(i >= this.graph2Histories.length)
    //       break;
    //   }
    // }
    for(let graph of this.graphs){
      graph.update();
    }
  }

  draw() {
    textSize(28);
    noStroke();
    fill(0);
    text(frameRate(), 40, 40);

    textSize(12);
    text(wm.rX(mouseX), mouseX, mouseY + 30);
    text(wm.rY(mouseY), mouseX, mouseY + 50);

    // if(this.showGraphs)
    //   this.drawFigures();


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
  }

  // drawFigures() {
  //   fill(255);
  //   strokeWeight(1);
  //   stroke(0);
  //   rect(1, this.graphSplit + 1, width / 2 - 1, height - 1);
  //   rect(width / 2 - 1, this.graphSplit + 1, width - 1, height - 1);

  //   let min1 = Infinity;
  //   let max1 = -Infinity;
  //   for(let history of this.graph1Histories){
  //     min1 = Math.min(history.reduce((a, b) => Math.min(a, b), Infinity), min1);
  //     max1 = Math.max(history.reduce((a, b) => Math.max(a, b), -Infinity), max1);
  //   }
  //   for(let i = 0; i < this.graph1Histories.length; i++){
  //     this.drawDataFig(this.graph1key + " car" + (i+1), this.graph1Histories[i], true, i + 1, min1, max1);
  //   }

  //   let min2 = Infinity;
  //   let max2 = -Infinity;
  //   for(let history of this.graph2Histories){
  //     min2 = Math.min(history.reduce((a, b) => Math.min(a, b), Infinity), min2);
  //     max2 = Math.max(history.reduce((a, b) => Math.max(a, b), -Infinity), max2);
  //   }
  //   for(let i = 0; i < this.graph2Histories.length; i++){
  //     this.drawDataFig(this.graph2key + " car" + (i+1), this.graph2Histories[i], false, i + 1, min2, max2);
  //   }
  // }

  // drawDataFig(title, data, fig1, col, min, max) {
  //   let fillColor;
  //   switch (col) {
  //     case 0:
  //       fillColor = color(0);
  //       break;
  //     case 1:
  //       fillColor = color(50, 50, 250);
  //       break;
  //     case 2:
  //       fillColor = color(50, 200, 50);
  //       break;
  //     case 3:
  //       fillColor = color(250, 50, 50);
  //       break;
  //     default:
  //       fillColor = color(100, 100, 100);
  //       break;
  //   }
    
  //   noStroke();
  //   fill(fillColor);
  //   text(title, fig1 ? 20 : width / 2 + 20, this.graphSplit + 20 + 10 * col);

  //   let dataMin = data.reduce((a, b) => Math.min(a, b), Infinity);
  //   let dataMax = data.reduce((a, b) => Math.max(a, b), -Infinity);

  //   text(dataMax.toFixed(2), fig1 ? width / 2 - 40 : width - 40, this.graphSplit + 10 + 10 * col);
  //   text(dataMin.toFixed(2), fig1 ? width / 2 - 40 : width - 40, height - 10 - 10 * col);

  //   noFill();
  //   strokeWeight(1);

  //   stroke(fillColor);
  //   beginShape();
  //   for (let i = 0; i < data.length; i++) {
  //     let x = map(i, 0, data.length, fig1 ? 1 : width / 2 + 1, fig1 ? width / 2 - 1 : width - 1);
  //     let y = map(data[i], min, max, height - 10, this.graphSplit + 10);

  //     vertex(x, y);
  //   }
  //   endShape();
  // }

  
  mousePressed() {}

  mouseReleased() {}

  mouseWheel(event) {}
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
    this.showDebug = false;
    this.showGraphs = true;
    this.showGrid = true;
    this.showCoordinates = true;
    this.showCar = true;
    this.showHistory = true;
    this.showConeType = true;
    this.showConePotential = true;
    this.showConeClassification = true;
    this.showConeClass
  }

  draw(){
    if(!this.show){
      text("Press 'c' to open control panel", 20, 20);
      return;
    }
  }
}

