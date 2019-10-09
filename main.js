const { fromEvent } = rxjs
const { map, switchMap, tap, pairwise, takeUntil, withLatestFrom, startWith } = rxjs.operators;

const canvas = document.querySelector('canvas');
const color = document.getElementById('color');
const range = document.getElementById('range');
const lineColor = document.getElementById('lineColor');
const lineWidht = document.getElementById('lineWidht');
const clearBtn = document.getElementById('clear');

lineColor.innerText = `Line color is ${color.value}`;
lineWidht.innerText = `line width is ${range.value}`;

const ctx = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();
const scale = window.devicePixelRatio;

canvas.width = rect.width * scale;
canvas.height = rect.height * scale;
ctx.scale(scale, scale);

const mouseDown$ = fromEvent(canvas, 'mousedown');
const mouseUp$ = fromEvent(canvas, 'mouseup').pipe(tap(() => ctx.beginPath()));
const mouseOut$ = fromEvent(canvas, 'mouseout').pipe(
  tap(() => ctx.beginPath())
);
const colorValue$ = fromEvent(color, 'input').pipe(
  map(e => {
      lineColor.innerText = `Line color is ${e.target.value}`;
      return e.target.value
  }),
  startWith(color.value)
);

const lineWidth$ = fromEvent(range, 'input').pipe(
  map(e => {
    lineWidht.innerText = `line width is ${e.target.value}`;
    return e.target.value;
  }),
  startWith(range.value)
);

const clearBtn$ = fromEvent(clearBtn, 'click')
    .subscribe(() => ctx.clearRect(0, 0, canvas.width, canvas.height));

mouseDown$
  .pipe(
    withLatestFrom(colorValue$, lineWidth$, (_, colorValue, lineWidth) => {
      return {
        colorValue,
        lineWidth
      };
    }),
    switchMap(options => {
      return fromEvent(canvas, 'mousemove').pipe(
        map(e => ({
          x: e.offsetX,
          y: e.offsetY,
          options
        })),
        pairwise(),
        takeUntil(mouseUp$),
        takeUntil(mouseOut$)
      );
    })
  )
  .subscribe(([from, to]) => {
    const { lineWidth, colorValue } = from.options;
    ctx.lineWidth = lineWidth * 2;
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;

    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(from.x, from.y, lineWidth, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
  });
