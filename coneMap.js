const spCenterX = 9.125;
const spCenterY = 15;

class ConeMap {
  constructor() {
    this.cones = [];
  }

  addCone(x, y, type = ConeType.SORANGE) {
    this.cones.push(new Cone(x, y, type));
  }

  addConeObj(cone) {
    this.cones.push(cone);
  }

  draw() {
    for (let c of this.cones) {
      c.draw();
    }
  }
}

function createSkidpad(radius = 9.125) {
  const m = new ConeMap();

  const centerX = radius;
  const centerY = 15;
  const innerR = radius - 1.5;
  const outerR = radius + 1.5;

  // Add circular cones
  for (let theta = 0; theta < 360; theta += 22.5) {
    const x = cos(radians(theta));
    const y = sin(radians(theta));

    // Add inner cones
    m.addCone(-centerX - x * innerR, centerY + y * innerR, ConeType.BLUE);
    m.addCone(centerX + x * innerR, centerY + y * innerR, ConeType.YELLOW);

    // Add outer cones
    if (theta > 45.1 && theta < 314.9) {
      m.addCone(-centerX + x * outerR, centerY + y * outerR, ConeType.YELLOW);
      m.addCone(centerX - x * outerR, centerY + y * outerR, ConeType.BLUE);
    }
  }

  // Start cones
  m.addCone(-1.5, 0, ConeType.SORANGE);
  m.addCone(1.5, 0, ConeType.SORANGE);
  m.addCone(-1.5, 5, ConeType.SORANGE);
  m.addCone(1.5, 5, ConeType.SORANGE);
  m.addCone(-1.5, 7, ConeType.YELLOW);
  m.addCone(1.5, 7, ConeType.BLUE);

  // Middle orange cones
  m.addCone(-1.5, 14, ConeType.BORANGE);
  m.addCone(1.5, 14, ConeType.BORANGE);
  m.addCone(-1.5, 16, ConeType.BORANGE);
  m.addCone(1.5, 16, ConeType.BORANGE);

  // End cones
  m.addCone(-1.5, 23, ConeType.YELLOW);
  m.addCone(1.5, 23, ConeType.BLUE);
  m.addCone(-1.5, 25, ConeType.SORANGE);
  m.addCone(1.5, 25, ConeType.SORANGE);
  m.addCone(-1.5, 30, ConeType.SORANGE);
  m.addCone(1.5, 30, ConeType.SORANGE);
  m.addCone(-1.5, 35, ConeType.SORANGE);
  m.addCone(1.5, 35, ConeType.SORANGE);
  m.addCone(-1.5, 40, ConeType.SORANGE);
  m.addCone(1.5, 40, ConeType.SORANGE);
  m.addCone(-0.5, 40, ConeType.SORANGE);
  m.addCone(0.5, 40, ConeType.SORANGE);

  return m;
}
