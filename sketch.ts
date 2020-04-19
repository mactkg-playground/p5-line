import p5 from "p5";

interface Point {
  x: number;
  y: number;
}
interface Pressure {
  p: number;
}
type PPoint = Point & Pressure;

interface Tan {
  l: Point;
  r: Point;
}

class Line {
  private points: PPoint[];
  private tans: Tan[];

  constructor(points: PPoint[], p: p5) {
    this.points = points;
    this.tans = this.calcTans(this.points, p);
    console.log(points, this.tans);
  }

  setPoints(points: PPoint[], p: p5) {
    this.points = points;
    this.tans = this.calcTans(this.points, p);
  }

  draw(p: p5) {
    p.push();
    p.beginShape()
    p.stroke(100, 100, 220);
    p.strokeWeight(1);
    const len = this.tans.length;
    p.curveVertex(this.tans[0].l.x, this.tans[0].l.y);
    for (let i = 0; i < len; i++) {
      const curr = this.tans[i].l;
      p.curveVertex(curr.x, curr.y);
    }
    p.curveVertex(this.tans[len - 1].l.x, this.tans[len - 1].l.y);
    p.endShape()

    p.beginShape()
    p.stroke(230, 130, 100);
    p.strokeWeight(1);
    p.curveVertex(this.tans[0].r.x, this.tans[0].r.y);
    for (let i = 0; i < len; i++) {
      const curr = this.tans[i].r;
      p.curveVertex(curr.x, curr.y);
    }
    p.curveVertex(this.tans[len - 1].r.x, this.tans[len - 1].r.y);
    p.endShape()
    p.pop();
  }

  drawDebug(p: p5) {
    // shape
    this.drawDebugShape(p);

    // points
    this.drawDebugPoints(p);

    // width
    this.drawDebugWidth(p);
  }

  private calcTans(points: PPoint[], p: p5): Tan[] {
    let results: Tan[] = [];
    const first: Point = points[0]
    const last: Point = points[points.length - 1];
    results.push({ l: first, r: first });

    for (let i = 1; i < points.length - 1; i++) {
      /* select control points */
      const ctrl1 = this.points[i - 1];
      const curr = this.points[i];
      const next = this.points[i + 1];
      let ctrl2 = this.points[i + 2];
      if (!ctrl2) {
        ctrl2 = this.points[i+1];
      }

      /* calculate tangent of the current point */
      const tx = p.curveTangent(ctrl1.x, curr.y, next.x, ctrl2.x, 0);
      const ty = p.curveTangent(ctrl1.y, curr.y, next.y, ctrl2.y, 0);
      const a = p.atan2(ty, tx) - p.PI / 2.0;
      const len = p.abs(curr.p * 10);
      const l = { x: p.cos(a) * len + curr.x, y: p.sin(a) * len + curr.y };
      const r = { x: p.cos(a + p.PI) * len + curr.x, y: p.sin(a + p.PI) * len + curr.y };
      results.push({ l, r });
    }

    results.push({ l: last, r: last });

    return results;
  }

  private drawDebugWidth(p: p5) {
    p.push();
    p.strokeWeight(2);
    p.stroke(255, 100, 100);
    this.tans.forEach((tans, i) => {
      const curr = this.points[i];
      p.line(curr.x, curr.y, tans.l.x, tans.l.y);
      p.line(curr.x, curr.y, tans.r.x, tans.r.y);
    });
    p.pop();
  }

  private drawDebugShape(p: p5) {
    p.push();
    p.beginShape()
    p.strokeWeight(1);
    const len = this.points.length;
    p.curveVertex(this.points[0].x, this.points[0].y);
    for (let i = 0; i < len; i++) {
      const curr = this.points[i];
      p.curveVertex(curr.x, curr.y);
    }
    p.curveVertex(this.points[len - 1].x, this.points[len - 1].y);
    p.endShape()
    p.pop();
  }

  private drawDebugPoints(p: p5) {
    p.push();
    p.strokeWeight(5);
    this.points.forEach(po => {
      p.point(po.x, po.y);
    });
    p.pop();
  }
}

const calcVector = (p1: PPoint, p2: PPoint) => {
  const x = p2.x - p1.x;
  const y = p2.y - p1.y;
  const l = Math.sqrt(x*x + y*y);
  return {x: x / l, y: y / l};
}

/**
 * @param {p5} p
 */
export const sketch = (p: p5) => {
  let l: Line;

  p.setup = () => {
    let po: PPoint[] = [];
    for (let i = 0; i < 10; i++) {
      po[i] = {x: i * 20 + 20, y: Math.sin(i / 6 * Math.PI) * 80 + 80, p: Math.cos(i / 8 * Math.PI + 0.4)};

    }
    l = new Line(po, p)

    p.createCanvas(600, 600);
    p.noFill();
  };

  p.draw = () => {
    let po: PPoint[] = [];
    let t = p.frameCount / 30 * p.PI / 6;
    for (let i = 0; i < 10; i++) {
      po[i] = {x: i * 20 + 20, y: Math.sin(i / 6 * Math.PI + t) * 80 + 80, p: Math.cos(i / 8 * Math.PI + 0.4 + t * p.mouseX / 10)};
    }
    l.setPoints(po, p);

    p.background(255);
    l.draw(p);
    l.drawDebug(p);
  };

  p.keyPressed = () => {
    // Export sketch's canvas to file
    if (p.keyCode === 80) {
      p.saveCanvas("sketch", "png");
    }
  };
};
