
const { Engine, Render, Runner, World, Bodies, Body } = Matter;

// Configuration
const scaleFactor = 0.6;
const barWidth = 60 * scaleFactor;
const barSpacing = 15 * scaleFactor;
const offsetY = 30;

// Canvas elements
const canvasOuter = document.getElementById("animationOuter");
const canvasInner = document.getElementById("animationInner");

canvasOuter.width = 400;
canvasOuter.height = 500;
canvasInner.width = 400;
canvasInner.height = 500;

// Engines and worlds
const engineOuter = Engine.create();
const engineInner = Engine.create();

const renderOuter = Render.create({
  canvas: canvasOuter,
  engine: engineOuter,
  options: {
    wireframes: false,
    background: "#f4f6f7",
    width: canvasOuter.width,
    height: canvasOuter.height
  }
});

const renderInner = Render.create({
  canvas: canvasInner,
  engine: engineInner,
  options: {
    wireframes: false,
    background: "#f4f6f7",
    width: canvasInner.width,
    height: canvasInner.height
  }
});

Render.run(renderOuter);
Render.run(renderInner);

Runner.run(Runner.create(), engineOuter);
Runner.run(Runner.create(), engineInner);

// Ground
function createGround(world, width, height) {
  const ground = Bodies.rectangle(width / 2, height + 20, width, 50, {
    isStatic: true,
    render: { fillStyle: "#f4f6f7" }
  });
  World.add(world, ground);
}

createGround(engineOuter.world, canvasOuter.width, canvasOuter.height);
createGround(engineInner.world, canvasInner.width, canvasInner.height);

// Bar definitions
const outerBars = [];
const innerBars = [];
const outerColors = ["#e57373", "#9575cd"];
const innerColors = ["#81c784", "#ffd54f", "#64b5f6"];

const outerHeights = [300, 300];
const innerHeights = [300, 300, 300];

const baseY = canvasOuter.height - 50 * scaleFactor;

// Create bars
function createBars(world, bars, colors, heights, xOffset = 80) {
  for (let i = 0; i < colors.length; i++) {
    const h = heights[i] * scaleFactor;
    const bar = Bodies.rectangle(
      xOffset + i * (barWidth + barSpacing) + barWidth / 2,
      baseY - h / 2 + offsetY,
      barWidth,
      h,
      {
        isStatic: true,
        render: { fillStyle: colors[i] }
      }
    );
    bars.push(bar);
    World.add(world, bar);
  }
}

createBars(engineOuter.world, outerBars, outerColors, outerHeights);
createBars(engineInner.world, innerBars, innerColors, innerHeights);

// Update bar heights
function updateBars(bars, heights, colors) {
  heights.forEach((newHeight, i) => {
    const newH = newHeight * scaleFactor;
    const oldH = bars[i].bounds.max.y - bars[i].bounds.min.y;
    const factor = newH / oldH;
    Body.scale(bars[i], 1, factor);
    Body.setPosition(bars[i], {
      x: bars[i].position.x,
      y: baseY - newH / 2 + offsetY
    });
    bars[i].render.fillStyle = colors[i];
  });
}

// Control logic
let active = false;

function toggleAnimation() {
  if (!active) {
    updateBars(outerBars, [200, 180], outerColors);
    updateBars(innerBars, [140, 120, 140], innerColors);
    active = true;
    document.getElementById("toggleBoth").textContent = "Reset All";
  } else {
    updateBars(outerBars, [300, 300], outerColors);
    updateBars(innerBars, [300, 300, 300], innerColors);
    active = false;
    document.getElementById("toggleBoth").textContent = "Start Impact Simulation";
  }
}
