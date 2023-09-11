const ConeType = {
    BLUE: 0,
    YELLOW: 1,
    SORANGE: 2,
    BORANGE: 3,
    VISION: 4
  };
  

class Cone {
  constructor(x, y, type = ConeType.SORANGE) {
    this.pos = createVector(x, y);
    this.type = type;
    this.classification = 0;
    this.potentialClassification = 0;
  }

  draw() {
    noStroke();
    let size = 10;

    switch (this.type) {
      case ConeType.BLUE:
        fill(0, 105, 180);
        break;
      case ConeType.YELLOW:
        fill(253, 211, 21);
        break;
      case ConeType.SORANGE:
      case ConeType.BORANGE:
        fill(243, 146, 0);
        break;
      case ConeType.VISION:
        fill(50);
        size = 5;
        break;
    }

    circle(wm.tX(this.pos.x), wm.tY(this.pos.y), size);
  }
}
  