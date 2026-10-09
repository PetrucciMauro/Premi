/*
 * DOMMatrix e DOMPoint minimi per i test: jsdom non li implementa.
 * Copre solo le operazioni usate da Premi, con le formule della specifica (Geometry Interfaces).
 * Gli elementi sono in ordine di colonna: [m11, m12, m13, m14, m21, ..., m44].
 */

class TestDOMPoint {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public w = 1,
  ) {}
}

class TestDOMMatrix {
  readonly m: number[];

  constructor(init?: string | number[]) {
    if (typeof init === 'string') {
      const values = init.slice(init.indexOf('(') + 1, init.lastIndexOf(')')).split(',').map(Number);
      init = values;
    }
    if (init?.length === 6) {
      const [a, b, c, d, e, f] = init;
      init = [a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, e, f, 0, 1];
    }
    this.m = init?.length === 16 ? [...init] : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  get m11() { return this.m[0]; }
  get m12() { return this.m[1]; }
  get m14() { return this.m[3]; }
  get m21() { return this.m[4]; }
  get m22() { return this.m[5]; }
  get m24() { return this.m[7]; }
  get m41() { return this.m[12]; }
  get m42() { return this.m[13]; }
  get m44() { return this.m[15]; }

  multiply(other: TestDOMMatrix): TestDOMMatrix {
    const a = this.m;
    const b = other.m;
    const out = new Array<number>(16);
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++)
        out[col * 4 + row] = [0, 1, 2, 3].reduce((sum, k) => sum + a[k * 4 + row] * b[col * 4 + k], 0);
    return new TestDOMMatrix(out);
  }

  translate(x = 0, y = 0, z = 0): TestDOMMatrix {
    return this.multiply(new TestDOMMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]));
  }

  scale(x = 1, y = x, z = 1): TestDOMMatrix {
    return this.multiply(new TestDOMMatrix([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]));
  }

  /** con un solo argomento ruota attorno all'asse z, come DOMMatrix */
  rotate(degrees = 0): TestDOMMatrix {
    return this.rotateAxisAngle(0, 0, 1, degrees);
  }

  rotateAxisAngle(x = 0, y = 0, z = 0, degrees = 0): TestDOMMatrix {
    const length = Math.hypot(x, y, z) || 1;
    [x, y, z] = [x / length, y / length, z / length];
    const half = (degrees * Math.PI) / 360;
    const sc = Math.sin(half) * Math.cos(half);
    const sq = Math.sin(half) ** 2;
    return this.multiply(
      new TestDOMMatrix([
        1 - 2 * (y * y + z * z) * sq, 2 * (x * y * sq + z * sc), 2 * (x * z * sq - y * sc), 0,
        2 * (x * y * sq - z * sc), 1 - 2 * (x * x + z * z) * sq, 2 * (y * z * sq + x * sc), 0,
        2 * (x * z * sq + y * sc), 2 * (y * z * sq - x * sc), 1 - 2 * (x * x + y * y) * sq, 0,
        0, 0, 0, 1,
      ]),
    );
  }

  transformPoint(p: TestDOMPoint): TestDOMPoint {
    const m = this.m;
    const { x, y, z, w } = p;
    return new TestDOMPoint(
      m[0] * x + m[4] * y + m[8] * z + m[12] * w,
      m[1] * x + m[5] * y + m[9] * z + m[13] * w,
      m[2] * x + m[6] * y + m[10] * z + m[14] * w,
      m[3] * x + m[7] * y + m[11] * z + m[15] * w,
    );
  }

  toString(): string {
    return `matrix3d(${this.m.join(', ')})`;
  }
}

const scope = globalThis as Record<string, unknown>;
scope['DOMMatrix'] ??= TestDOMMatrix;
scope['DOMPoint'] ??= TestDOMPoint;
