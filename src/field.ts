type Dot = {
  x: number;
  y: number;
  v?: number;
};

type Feature = {
  g?: number;
  k?: number;
  z?: number;
  tension?: number;
  stroke?: number;
  zoom?: number;
};

type Clip = {
  src?: string;
  rgb?: string;
  beta?: number;
  area?: Array<number>;
  dur?: number;
};

type Env = {
  ctx: CanvasRenderingContext2D;
  cx: number;
  cy: number;
  feature: Feature;
};

Array.from(document.querySelectorAll("canvas.field-fx")).forEach((c) =>
  fieldFx(c as HTMLCanvasElement)
);

declare global {
  let fieldFx: CallableFunction;

  interface HTMLCanvasElement {
    clips: Array<Clip>;
    play: CallableFunction;
    stop: CallableFunction;
    reload: CallableFunction;
    draw: CallableFunction;
    playing: number;
  }
}

globalThis.fieldFx = fieldFx;
globalThis.dispatchEvent(new CustomEvent("field-fx-ready"));

export function fieldFx(canvas: HTMLCanvasElement, opts?: Feature): void {
  const feature: Feature = {
    g: 1,
    k: 1,
    z: 2,
    tension: .25,
    stroke: 1,
    zoom: 1,
  };
  if (opts) {
    if (opts.g) feature.g = opts.g;
    if (opts.k) feature.k = opts.k;
    if (opts.z) feature.z = opts.z;
    if (opts.tension) feature.tension = opts.tension;
  }
  const alpha = 12;
  const splitOpacity = "99";

  const customize = () => {
    const dset = canvas.dataset;
    const {
      origin,
      src = "/img/mindon.png",
      rgb = "",
      unit = "8",
      stroke = "1",
      zoom = "1",
      area = "",
    } = dset;
    feature.stroke = parseFloat(stroke) || 1;
    feature.zoom = parseFloat(zoom) || 1;
    return {
      showOrigin: origin !== undefined,
      src,
      rgb,
      beta: parseInt(unit, 10) || 8,
      area: area && /^\d+(,\d+){3}$/.test(area)
        ? area.split(",").map((v) => parseInt(v, 10))
        : undefined,
    };
  };

  let { showOrigin, src, rgb, beta, area } = customize();

  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  let cached: {
    red: Array<Dot>;
    green: Array<Dot>;
    blue: Array<Dot>;
    lightness: Array<Dot>;
  };

  let [cx, cy, r] = [0, 0, 0];

  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;

  let env: Env;
  const cv = document.createElement("canvas");
  const img = new Image();

  const load = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let [w, h] = [img.naturalWidth, img.naturalHeight];
    if (!area && (w > 960 || h > 960)) {
      const ratio = Math.max(w / 562, h / 562);
      area = [0, 0, w / ratio, h / ratio];
    }
    if (area) {
      [w, h] = area.slice(2);
    }
    [cx, cy, r] = [w / 2, h / 2, Math.sqrt((w / 2) ** 2 + (h / 2) ** 2)];
    env = { ctx, cx, cy, feature };
    canvas.width = w * (feature.zoom || 1);
    canvas.height = h * (feature.zoom || 1);

    const [iw, ih] = [Math.round(w / beta), Math.round(h / beta)];
    cv.width = iw;
    cv.height = ih;
    const xc = cv.getContext("2d");
    let [dx, dy] = [0, 0];
    if (area) {
      [dx, dy] = area.slice(0, 2);
    }
    xc?.drawImage(
      img,
      dx,
      dy,
      !area ? img.width : w,
      !area ? img.height : h,
      0,
      0,
      iw,
      ih,
    );
    if (showOrigin) {
      img.width = w;
      img.height = h;
      canvas.parentElement?.appendChild(img);
    }
    const data = xc?.getImageData(0, 0, iw, ih).data;
    // console.log(data, w * h, (data?.length || 0) / (w * h));
    const red: Array<Dot> = [];
    const green: Array<Dot> = [];
    const blue: Array<Dot> = [];
    const lightness: Array<Dot> = [];

    let matrix: Array<Array<number>> = [];
    // scan lines
    // for (let j = 0; j < ih; j++) {
    //   for (let i = 0; i < iw; i++) {
    //     matrix.push([i, j]);
    //   }
    // }

    // reverse
    // matrix.reverse();

    // spiral
    const origin: Array<Array<Array<number>>> = [];
    for (let j = 0; j < ih; j++) {
      const ja: Array<Array<number>> = [];
      for (let i = 0; i < iw; i++) {
        ja.push([i, j]);
      }
      origin.push(ja);
    }

    matrix = spiral(origin);

    matrix.forEach(([i, j]) => {
      const [x, y, z] = [i * beta, j * beta, 4 * (j * iw + i)];
      const opacity = (data?.[z + 3] || 0) / 255;
      const r: Dot = {
        x,
        y,
        v: (255 - (data?.[z] || 0)) * opacity,
      };
      const g: Dot = {
        x,
        y,
        v: (255 - (data?.[z + 1] || 0)) * opacity,
      };
      const b: Dot = {
        x,
        y,
        v: (255 - (data?.[z + 2] || 0)) * opacity,
      };
      lightness.push({
        x,
        y,
        v: (255 -
          ((data?.[z] || 0) * .299 +
            (data?.[z + 1] || 0) * .587 +
            (data?.[z + 2] || 0) * .114)) * opacity,
      });
      // if (opacity !== 0) console.log(i, j, r.v, g.v, b.v, opacity);
      red.push(r);
      green.push(g);
      blue.push(b);
    });

    cached = { red, green, blue, lightness };
    // console.log(cached);
    draw();
  };
  img.crossOrigin = "anonymous";
  img.addEventListener("load", load);

  if (src) {
    img.src = src;
  }

  const draw = () => {
    if (!ctx || !env) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { red, green, blue, lightness } = cached;
    const num = Math.floor(r / beta), offset = 10;
    ctx.lineWidth = feature.stroke || 1;
    if (/[rR*]/.test(rgb)) {
      ctx.beginPath();
      ctx.strokeStyle = `#ff0000${splitOpacity}`;
      for (let i = 0; i < num; i++) {
        cc(env, offset + i * beta, alpha, red);
      }
      ctx.stroke();
    }
    if (/[gG*]/.test(rgb)) {
      ctx.beginPath();
      ctx.strokeStyle = `#008800${splitOpacity}`;
      for (let i = 0; i < num; i++) {
        cc(env, offset + i * beta, alpha, green);
      }
      ctx.stroke();
    }
    if (/[bB*]/.test(rgb)) {
      ctx.beginPath();
      ctx.strokeStyle = `#0000ff${splitOpacity}`;
      for (let i = 0; i < num; i++) {
        cc(env, offset + i * beta, alpha, blue);
      }
      ctx.stroke();
    }
    if (!rgb || /[#*]/.test(rgb)) {
      ctx.beginPath();
      ctx.strokeStyle = "#000000";
      for (let i = 0; i < num; i++) {
        cc(env, offset + i * beta, alpha, lightness);
      }
      ctx.stroke();
    }
  };

  canvas.reload = () => {
    ({ showOrigin, src, rgb, beta, area } = customize());
    if (src != img.src) {
      img.src = src;
    } else {
      load();
    }
  };
  canvas.draw = draw;
  canvas.stop = function () {
    if (this.playing) {
      clearTimeout(this.playing);
    }
    this.dispatchEvent(new CustomEvent("stop"));
  };
  canvas.play = function (clips?: Array<Clip>, loop = true) {
    if (clips) {
      this.clips = clips;
    } else {
      clips = this.clips;
    }
    if (!clips || !clips.length) {
      throw new Error("clips required");
    }
    if (this.playing) {
      clearTimeout(this.playing);
    }
    let i = 0;
    const imax = clips.length;
    const playing = () => {
      if (!clips) return;
      if (i >= imax) {
        i = 0;
        this.dispatchEvent(new CustomEvent("fin"));
        if (!loop) return;
      }
      const clip = clips[i++];
      if (clip.src) src = clip.src;
      if (clip.rgb) rgb = clip.rgb;
      if (clip.area && clip.area.length === 4) area = clip.area;
      if (src != img.src) {
        img.src = src;
      } else {
        load();
      }
      this.playing = setTimeout(playing, (clip.dur || .3) * 1000);
    };
    playing();
  };
}

function cc(env: Env, r0: number, deg: number, pixels: Array<Dot>) {
  const theta = deg * Math.PI / 180;
  const { ctx, cx, cy, feature } = env;

  const xy = Array.from(Array(Math.ceil(360 / deg)).keys()).map((i) => {
    const source = {
      x: cx + r0 * Math.cos(theta * i),
      y: cy - r0 * Math.sin(theta * i),
    };
    const s = { x: source.x, y: source.y };
    pixels?.forEach((k) => {
      const d = delta(k, k.v || 0, s, feature);
      s.x += d.x;
      s.y += d.y;
    });
    return s;
  });

  const { zoom = 1, tension = 0.25 } = feature;
  const points = xy.map((p) => [zoom * p.x, zoom * p.y]);
  ctx && bezier(
    ctx,
    points,
    tension,
  );
}

function delta(
  dot: Dot,
  weight: number,
  source: Dot,
  feature: Feature,
) {
  const { x, y } = dot;
  const cx = source.x;
  const cy = source.y;
  const { g = 1, k = 1, z = 2 } = feature;

  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const f = g * weight / (d ** z);
  let alpha = x === cx
    ? (y > cy ? Math.PI / 2 : -Math.PI / 2)
    : Math.atan((y - cy) / (x - cx));
  if (y === cy) {
    alpha = x < cx ? Math.PI : 0;
  } else if (x < cx) {
    alpha -= Math.PI;
  }
  const result = { x: f * Math.cos(alpha) / k, y: f * Math.sin(alpha) / k };
  if (Math.abs(result.x) > Math.abs(dot.x - source.x)) {
    result.x = dot.x - source.x;
  }
  if (Math.abs(result.y) > Math.abs(dot.y - source.y)) {
    result.y = dot.y - source.y;
  }
  return result;
}

// ------------
function spiral(
  matrix: Array<Array<Array<number>>>,
  reversed = true,
): Array<Array<number>> {
  const [row, col] = [matrix.length, matrix[0].length];
  const seen = matrix.map((line) => line.map((_) => false));
  const ans: Array<Array<number>> = [];
  const dr = [0, 1, 0, -1];
  const dc = [1, 0, -1, 0];
  let [ir, ic, di] = [0, 0, 0];

  for (let i = 0; i < row * col; i++) {
    ans.push(matrix[ir][ic]);
    seen[ir][ic] = true;
    const [cr, cc] = [ir + dr[di], ic + dc[di]];
    if (0 <= cr && cr < row && 0 <= cc && cc < col && !seen[cr][cc]) {
      [ir, ic] = [cr, cc];
    } else {
      di = (di + 1) % 4;
      [ir, ic] = [ir + dr[di], ic + dc[di]];
    }
  }
  return reversed ? ans.reverse() : ans;
}

// -------------
// https://github.com/dobarkod/canvas-bezier-multiple
function bezier(
  ctx: CanvasRenderingContext2D,
  points: Array<Array<number>>,
  tension: number,
  closed = true,
) {
  tension = tension || 0.25;

  const l = points.length;
  if (l < 2) return;

  ctx.beginPath();

  if (l === 2) {
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.stroke();
    return;
  }

  const h = (x: number, y: number) => Math.sqrt(x * x + y * y);
  const cpoints: Array<{ cp: Array<number>; cn: Array<number> }> = [];
  points.forEach(function () {
    cpoints.push({ cp: [], cn: [] });
  });

  for (let i = 0; i < l; i++) {
    const pi = points[i],
      pp = points[i - 1 < 0 ? l + i - 1 : i - 1],
      pn = points[i + 1 > l - 1 ? (i + 1) % l : i + 1];

    const rdx = pn[0] - pp[0],
      rdy = pn[1] - pp[1],
      rd = h(rdx, rdy),
      dx = rdx / rd,
      dy = rdy / rd;

    const dp = h(pi[0] - pp[0], pi[1] - pp[1]),
      dn = h(pi[0] - pn[0], pi[1] - pn[1]);

    const cpx = pi[0] - dx * dp * tension,
      cpy = pi[1] - dy * dp * tension,
      cnx = pi[0] + dx * dn * tension,
      cny = pi[1] + dy * dn * tension;

    cpoints[i] = {
      cp: [cpx, cpy],
      cn: [cnx, cny],
    };
  }

  ctx.moveTo(points[0][0], points[0][1]);

  const imax = closed ? l + 1 : l;
  for (let i = 1; i < imax; i++) {
    const p = points[i % l],
      cp = cpoints[i % l],
      cpp = cpoints[i - 1];
    ctx.bezierCurveTo(cpp.cn[0], cpp.cn[1], cp.cp[0], cp.cp[1], p[0], p[1]);
  }

  ctx.stroke();
}
