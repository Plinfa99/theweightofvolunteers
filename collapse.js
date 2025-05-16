document.addEventListener("DOMContentLoaded", () => {
  const pillars = document.querySelectorAll(".pillar-bar");
  const groupImage = document.getElementById("group-image");
  const groupWrapper = document.querySelector(".group-wrapper");
  const button = document.getElementById("collapse-btn");

  const toggleButton = document.getElementById("toggleBtn");
  const modeSwitcher = document.getElementById("mode-switcher");
  const modeHoursBtn = document.getElementById("mode-hours");
  const modePersonsBtn = document.getElementById("mode-persons");

  modeSwitcher.style.display = "none";
modeHoursBtn.style.display = "none";
modePersonsBtn.style.display = "none";


  const canvas = document.getElementById("animation");
  canvas.width = 800;
  canvas.height = 500;

  const {
    Engine, Render, Runner, World, Bodies, Body
  } = Matter;

  const engine = Engine.create();
  const world = engine.world;

  const scaleFactor = 0.6;
  let collapsedCanvas = false;
  let currentMode = "hours";
  let aktuelleStufe = 1;

  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      wireframes: false,
      background: "#f4f6f7",
      width: canvas.width,
      height: canvas.height
    }
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);

  const barColors = ["#2b5b66", "#6db2cc", "#a9b97f", "#adc4a0", "#bdd8a0", "#f9a825", "#f15623"];
  const pillarInfosHours = [
    {
      class: "economy",
      percent: "- 0,4%",
      title: "ECONOMY",
      summary: "Almost all work in this field is done by professionals.",
      detail: "<br>With professionals working 35 hours per week and volunteers only 2–7, unpaid labor makes up just 0.4% of total hours — typically assisting in non-critical roles such as citizen consultation, repair cafés, or neighborhood development."
    },
    {
      class: "justice",
      percent: "- 0,7%",
      title: "JUSTICE",
      summary: "Full-time professionals cover nearly all working time.",
      detail: "<br>Given a 41-hour week for salaried staff and minimal volunteer hours, unpaid help contributes less than 1% of the total time — but often provides essential outreach, prevention, or access functions at local level."
    },
    {
      class: "socialcare",
      percent: "- 4,4%",
      title: "SOCIAL CARE",
      summary: "The vast majority of care work is done by professionals.",
      detail: "<br>Given typical commitments of 2–7 hours per week, unpaid helpers collectively provide 4.4% of the total hours, while employed staff work around 39 hours weekly. Their efforts often complement professional care with emotional, social, or practical support."
    },

    {
      class: "ecology",
      percent: "- 3,4%",
      title: "ECOLOGY",
      summary: "Professionals cover the majority of environmental work time.",
      detail: "<br>With professionals working 35 hours weekly and volunteers averaging only a few hours, unpaid efforts account for just 3.4% of total time — though often filling critical gaps in public outreach, ecological monitoring, or community engagement."
    },
    {
      class: "education",
      percent: "- 14,8%",
      title: "EDUCATION",
      summary: "Full-time educators provide most of the working hours.",
      detail: "<br>Assuming teachers work around 46 hours per week, and volunteers 2–7 hours, the unpaid share comes to just 14.8% of total time. Volunteers add flexibility and personalized learning support to the education system, often working with vulnerable or underserved groups."
    },
    {
      class: "culture",
      percent: "- 50,6%",
      title: "CULTURE",
      summary: "Volunteers account for more than half the working time.",
      detail: "<br>Although each person contributes only 2–7 hours weekly, the collective time equals or exceeds that of professionals — resulting in 50.6% of all hours. Their work includes coaching, event planning, maintenance, cultural education, and youth engagement."
    },
    {
      class: "rescue",
      percent: "- 72,2%",
      title: "CIVIL PROTECTION AND RESCUE",
      summary: "Roughly all of the workers in the civil protection in Germany are volunteers.",
      detail: "<br> While volunteers typically contribute only a few hours per week, their massive numbers result in a large total impact. They are covering emergency response, logistics, medical aid, and regular training."
    },

  ];

  const pillarInfosPersons = [
    {
      class: "economy",
      percent: "- 4,1% (Persons)",
      title: "ECONOMY",
      summary: "Volunteer involvement in infrastructure and economy is rare.",
      detail: "<br>About 547,000 volunteer people are active here. Compared to 12.67 million professionals in logistics, construction, utilities, and energy, this results in just 4.1% of total contributors.This includes unpaid involvement in logistics, trade and digital infrastructure."
    },
    {
      class: "justice",
      percent: "- 7,5% (Persons)",
      title: "JUSTICE",
      summary: "Volunteers play a minor role in safety and legal services.",
      detail: "<br>0.6% of all volunteers — around 173,000 people — are involved here. Compared to 2.13 million professionals, they make up 7.5% of all contributors. They support in community patrols, citizen mediation, victim assistance, or public legal education."
    },
    {
      class: "socialcare",
      percent: "- 34,9% (Persons)",
      title: "SOCIAL CARE",
      summary: "One in three individuals in the social sector is unpaid.",
      detail: "<br>10.3% of Germany’s volunteers — about 2.97 million — are active in this field. Compared to 5.52 million professionals, volunteers make up 34.9% of all contributors. They assist in elderly care, disability support, food distribution, neighborhood outreach, or hospice services."
    },

    {
      class: "ecology",
      percent: "- 27% (Persons)",
      title: "ECOLOGY",
      summary: "One in four people contributing to environmental protection is a volunteer.",
      detail: "<br>4.1% of all volunteers (1.18 million) are engaged in this field. Compared to 3.2 million professionals, they represent 27% of all contributors. Volunteers clean rivers, plant trees, educate on sustainability, and campaign for climate justice."
    },
    {
      class: "education",
      percent: "- 70,7% (Persons)",
      title: "EDUCATION",
      summary: "Volunteers make up the majority of people in educational activities.",
      detail: "<br>About 4.2 million volunteer people in germany are active in education. Compared to 1.74 million salaried staff, they represent 70.7% of total contributors. They support children with reading and homework, help refugees learn German, or tutor youth in afterschool programs."
    },
    {
      class: "culture",
      percent: "- 92,3% (Persons)",
      title: "CULTURE",
      summary: "Germany’s cultural and sports life relies almost entirely on volunteers.",
      detail: "<br>Roughly 35% of volunteers (≈10.08 million people) are active in this field — organizing local festivals, leading sports teams, managing associations, running music clubs or libraries. They outnumber the 837,000 professionals by more than tenfold."
    },
    {
      class: "rescue",
      percent: "- 96,6% (Persons)",
      title: "CIVIL PROTECTION AND RESCUE",
      summary: "Civil protection relies almost entirely on volunteers.",
      detail: "<br> In Germany’s civil protection system, approximately 1.76 million people are engaged on a volunteer basis. Based on operational ratios (e.g. fire brigades), this makes up about 96.6% of all active personnel."
    },

  ];
  

  const stufe1Heights = [350, 350, 350, 350, 350, 350, 350];
  const stufe2HeightsHours = [348.6, 347.6, 334.6, 338.1, 298.2, 172.9, 72];
  const stufe2HeightsPersons = [335.7, 323.8, 227.8, 255.5, 102.6, 27, 11.9];

  const numberOfBars = barColors.length;
  const barWidth = 70 * scaleFactor;
  const barSpacing = 10 * scaleFactor;
  const baseY = canvas.height - 50 * scaleFactor;
  const totalBarWidth = numberOfBars * (barWidth + barSpacing) - barSpacing;
  const offsetX = 10;
  const offsetY = 30; // negativer Wert hebt die Grafik an, positiver senkt sie ab


  const ground = Bodies.rectangle(canvas.width / 2, canvas.height + 20, canvas.width, 50, {
    isStatic: true,
    render: { fillStyle: "#f4f6f7" }
  });
  World.add(world, ground);

  const bars = [];
  for (let i = 0; i < numberOfBars; i++) {
    const h = stufe1Heights[i] * scaleFactor;
    const bar = Bodies.rectangle(
      offsetX + i * (barWidth + barSpacing) + barWidth / 2,
      baseY - h / 2 + offsetY,
      barWidth,
      h,
      {
        isStatic: true,
        render: { fillStyle: barColors[i] }
      }
    );
    bars.push(bar);
  }
  World.add(world, bars);

  let platformHeight = Math.max(...stufe1Heights.map(h => h * scaleFactor));
  const platform = Bodies.rectangle(offsetX + totalBarWidth / 2, baseY - platformHeight - 10 + offsetY, totalBarWidth, 20 * scaleFactor, {
    chamfer: { radius: 5 },
    friction: 0.9,
    restitution: 0.1,
    render: {
      fillStyle: "#ffffff",
      strokeStyle: "#000000",
      lineWidth: 1
    }
  });
  World.add(world, platform);

  const bild1 = new Image();
  bild1.src = "figuren/figur1.png";
  const bild2 = new Image();
  bild2.src = "figuren/figur2.png";

  toggleButton.addEventListener("click", () => {
    collapsedCanvas = !collapsedCanvas;
    const explanationBox = document.getElementById("collapse-explanation");
if (explanationBox) {
  explanationBox.classList.toggle("hidden", !collapsedCanvas);
}

    hideInfoPanel();
    const inlineInfo = document.querySelector(".inline-info");

    if (collapsedCanvas) {
      inlineInfo.classList.remove("hidden");
      modeSwitcher.classList.remove("hidden");
      modeHoursBtn.classList.add("active");
      currentMode = "hours";
    } else {
      inlineInfo.classList.add("hidden");
      modeSwitcher.classList.add("hidden");
    }

    // Sichtbarkeit der Buttons abhängig vom collapsedCanvas-Zustand
    modeSwitcher.style.display = collapsedCanvas ? "flex" : "none";
    modeHoursBtn.style.display = collapsedCanvas ? "inline-block" : "none";
    modePersonsBtn.style.display = collapsedCanvas ? "inline-block" : "none";
    


    aktuelleStufe = collapsedCanvas ? 2 : 1;
    updateBarsForMode();

    const textDisappear = toggleButton.querySelector(".text-disappear");
const textBring = toggleButton.querySelector(".text-bring");

if (collapsedCanvas) {
  textDisappear.classList.add("hidden");
  textBring.classList.remove("hidden");
} else {
  textDisappear.classList.remove("hidden");
  textBring.classList.add("hidden");
}

    
    if (!collapsedCanvas) {
      // Plattform zentriert zurücksetzen (reset)
      platformHeight = Math.max(...stufe1Heights.map(h => h * scaleFactor));
      Body.setPosition(platform, {
        x: offsetX + totalBarWidth / 2,
        y: baseY - platformHeight - 10 + offsetY
      });
      Body.setAngle(platform, 0);
      Body.setVelocity(platform, { x: 0, y: 0 });
      Body.setAngularVelocity(platform, 0);
    }

toggleButton.classList.toggle("active", collapsedCanvas);
  });


  modeHoursBtn.addEventListener("click", () => {
    currentMode = "hours";
    modeHoursBtn.classList.add("active");
    modePersonsBtn.classList.remove("active");
    updateBarsForMode();
    hideInfoPanel();
  });

  modePersonsBtn.addEventListener("click", () => {
    currentMode = "persons";
    modePersonsBtn.classList.add("active");
    modeHoursBtn.classList.remove("active");
    updateBarsForMode();
    hideInfoPanel();
  });

  function updateBarsForMode() {
    const neueHeights = aktuelleStufe === 1 ? stufe1Heights :
      currentMode === "hours" ? stufe2HeightsHours : stufe2HeightsPersons;
    const neueMax = Math.max(...neueHeights.map(h => h * scaleFactor));

    bars.forEach((bar, i) => {
      const neueH = neueHeights[i] * scaleFactor;
      const alteH = bar.bounds.max.y - bar.bounds.min.y;
      const faktor = neueH / alteH;

      Body.scale(bar, 1, faktor);
      Body.setPosition(bar, {
        x: bar.position.x,
        y: baseY - neueH / 2 + offsetY
      });
    });

    const zielY = baseY - neueMax - 10;
    Body.setPosition(platform, {
      x: offsetX + totalBarWidth / 2,
      y: zielY + offsetY
    });
  }

  canvas.addEventListener("click", (event) => {
    if (!collapsedCanvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const bounds = bar.bounds;

      if (
        mouseX >= bounds.min.x &&
        mouseX <= bounds.max.x &&
        mouseY >= bounds.min.y &&
        mouseY <= bounds.max.y
      ) {
        showInfoPanel(i);
        return;
      }
    }
  });

  function showInfoPanel(index) {
    const panel = document.getElementById("canvas-info-panel");
    const info = aktuelleStufe === 1 ? pillarInfos[index] :
      currentMode === "hours" ? pillarInfosHours[index] : pillarInfosPersons[index];

    panel.className = "info-panel " + info.class;
    panel.innerHTML = `
  <div class="info-layout">
    <button class="info-close" id="close-info-panel">×</button>
    <div class="info-header">
      <div class="info-icon">i</div>
      <div class="info-value">${info.percent}</div>
    </div>

        <div class="info-title">${info.title}</div>
        <div class="info-body">
          <p><strong>${info.summary}</strong></p>
          <p>${info.detail}</p>
        </div>
      </div>
    `;
    panel.classList.remove("hidden");

    // Dynamischen "X"-Button aktivieren
const closeBtn = document.getElementById("close-info-panel");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    hideInfoPanel();
  });
}

  }

  function hideInfoPanel() {
    const panel = document.getElementById("canvas-info-panel");
    panel.classList.add("hidden");
  }

  (function customRendering() {
    const context = render.context;
    function loop() {
      requestAnimationFrame(loop);
      context.clearRect(0, 0, canvas.width, canvas.height);
      Render.world(render);

      const aktuellesBild = aktuelleStufe === 1 ? bild1 : bild2;
      const faktor = 1 * scaleFactor;

      if (aktuellesBild.complete && aktuellesBild.width && aktuellesBild.height) {
        const breite = aktuellesBild.width * faktor;
        const hoehe = aktuellesBild.height * faktor;

        context.save();
        context.translate(platform.position.x, platform.position.y);
        context.rotate(platform.angle);
        context.drawImage(aktuellesBild, -breite / 2, -hoehe - 10, breite, hoehe);
        context.restore();
      }
    }
    loop();
  })();
});


canvas.addEventListener("click", (event) => {
  if (!collapsedCanvas) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const bounds = bar.bounds;

    if (
      mouseX >= bounds.min.x &&
      mouseX <= bounds.max.x &&
      mouseY >= bounds.min.y &&
      mouseY <= bounds.max.y
    ) {
      showInfoPanel(i);
      return;
    }
  }
});



function showInfoPanel(index) {
  const panel = document.getElementById("canvas-info-panel");
  const info = pillarInfos[index];
  panel.className = "info-panel " + info.class;
  panel.innerHTML = `
    <div class="info-layout">
      <div class="info-header">
        <div class="info-icon">i</div>
        <div class="info-value">${info.percent}</div>
      </div>
      <div class="info-title">${info.title}</div>
      <div class="info-body">
        <p><strong>${info.summary}</strong></p>
        <p>${info.detail}</p>
      </div>
    </div>
  `;
  panel.classList.remove("hidden");
}

function hideInfoPanel() {
  const panel = document.getElementById("canvas-info-panel");
  panel.classList.add("hidden");
}


function hideInfoPanel() {
  const panel = document.getElementById("canvas-info-panel");
  panel.classList.add("hidden");
}

function togglePillar(clicked) {
  const all = document.querySelectorAll(".core");
  const isOpen = clicked.classList.contains("expanded");
  all.forEach(c => c.classList.remove("expanded"));
  if (!isOpen) clicked.classList.add("expanded");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".core").forEach(el => {
    el.addEventListener("click", () => togglePillar(el));
  });
});

// Schließen per "X"-Button
document.addEventListener("click", (event) => {
  const panel = document.getElementById("canvas-info-panel");

  if (event.target.id === "close-info-panel") {
    hideInfoPanel();
  }

  // Klick außerhalb schließt Panel
  if (
    !panel.classList.contains("hidden") &&
    !panel.contains(event.target) &&
    event.target.tagName !== "CANVAS"
  ) {
    hideInfoPanel();
  }
});
document.addEventListener("click", (event) => {
  const panel = document.getElementById("canvas-info-panel");
  if (!panel || panel.classList.contains("hidden")) return;

  if (!panel.contains(event.target)) {
    hideInfoPanel();
  }
});

