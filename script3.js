// Matter.js Setup
const { Engine, Render, Runner, World, Bodies, Body } = Matter;

const canvas = document.getElementById("animation");
canvas.width = 600;
canvas.height = 750;

const engine = Engine.create();
engine.timing.timeScale = 1.5; // 1.0 = normal, 2.0 = doppelt so schnell

const world = engine.world;
const scaleFactor = 0.9;

const render = Render.create({
  canvas,
  engine,
  options: {
    wireframes: false,
    background: "#f4f6f7",
    width: canvas.width,
    height: canvas.height
  }
});
Render.run(render);
const runner = Runner.create();
runner.delta = 1000 / 120; // doppelt so schnell wie Standard
Runner.run(runner, engine);


const barColors = ["#2b5b66", "#6db2cc", "#a9b97f",  "#f9a825", "#f15623"];

const defaultHeights = [300, 200, 200, 200, 300];
const numberOfBars = barColors.length;
const barWidth = 60 * scaleFactor;
const barSpacing = 15 * scaleFactor;
const baseY = canvas.height - 50 * scaleFactor;
const totalWidth = numberOfBars * (barWidth + barSpacing) - barSpacing;
const offsetX = (canvas.width - totalWidth) / 2;

const offsetY = 10;
const totalBarWidth = numberOfBars * (barWidth + barSpacing) - barSpacing;

const ground = Bodies.rectangle(canvas.width / 2, canvas.height + 20, canvas.width, 50, {
  isStatic: true,
  render: { fillStyle: "#f4f6f7" }
});
World.add(world, ground);

// Unsichtbarer Rahmen (Begrenzung)
const borderThickness = 50;

const leftWall = Bodies.rectangle(0 - borderThickness / 2, canvas.height / 2, borderThickness, canvas.height * 2, {
  isStatic: true,
  render: { visible: false }
});
const rightWall = Bodies.rectangle(canvas.width + borderThickness / 2, canvas.height / 2, borderThickness, canvas.height * 2, {
  isStatic: true,
  render: { visible: false }
});
const topWall = Bodies.rectangle(canvas.width / 2, -borderThickness / 2, canvas.width, borderThickness, {
  isStatic: true,
  render: { visible: false }
});
const bottomWall = Bodies.rectangle(canvas.width / 2, canvas.height + borderThickness / 2, canvas.width, borderThickness, {
  isStatic: true,
  render: { visible: false }
});

World.add(world, [leftWall, rightWall, topWall, bottomWall]);

const bars = [];
for (let i = 0; i < numberOfBars; i++) {
  const h = defaultHeights[i] * scaleFactor;
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
// Dünne mittlere Hilfssäule zur Balancierstabilisierung
const centerBar = Bodies.rectangle(
  canvas.width / 2,
  baseY - (300 * scaleFactor) / 2 + offsetY,
  4,
  290 * scaleFactor,
  {
    isStatic: true,
    render: { fillStyle: "#f4f6f7" },
    plugin: { render: { zIndex: -1 } } // Hintergrundebene
  }
);
World.add(world, centerBar);

World.add(world, bars);

const platform = Bodies.rectangle(offsetX + totalBarWidth / 2, 0, totalBarWidth, 20 * scaleFactor, {
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

const images = {
  neutral: new Image(),
  happy: new Image(),
  sad: new Image(),
  leftweight: new Image(),
  rightweight: new Image(),
  bothweights: new Image(),
  leftweight_happy: new Image(),
  rightweight_happy: new Image(),
  bothweights_happy: new Image(),
  leftweight_sad: new Image(),
  rightweight_sad: new Image(),
  bothweights_sad: new Image()
};
for (const [key, img] of Object.entries(images)) {
  img.src = `figuren/${key}.png`;
}

function updateBars(values) {
  const displayHeights = values.map((v, i) => {
    const max = (i === 0 || i === 4) ? 300 : 200;
    return Math.max(0, Math.min(v, max));
  });

  displayHeights.forEach((newHeight, i) => {
    const newH = newHeight * scaleFactor;
    const oldH = bars[i].bounds.max.y - bars[i].bounds.min.y;
    if (oldH > 0) {
      const factor = newH / oldH;
      Body.scale(bars[i], 1, factor);
      Body.setPosition(bars[i], {
        x: bars[i].position.x,
        y: baseY - newH / 2 + offsetY
      });

      
    }
  });

  const maxHeight = Math.max(...displayHeights);
  const cappedMaxHeight = Math.min(maxHeight, Math.max(...displayHeights.map((h, i) => (i === 0 || i === 4) ? 300 : 200)));

  Body.setPosition(platform, {
    x: offsetX + totalBarWidth / 2,
    y: baseY - cappedMaxHeight * scaleFactor - 10 + offsetY
  });
  // Entfernt: automatische Ausrichtung der Plattform, um realistisches Kippen zu ermöglichen
}

(function loop() {
  const context = render.context;
  function animate() {
    requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height);
    Render.world(render);

    const leftOuter = bars[0].bounds.max.y - bars[0].bounds.min.y;
    const rightOuter = bars[4].bounds.max.y - bars[4].bounds.min.y;
    const angleTilt = (rightOuter - leftOuter) * 0.0005;


    const psychHeight = bars[2].bounds.max.y - bars[2].bounds.min.y;
    const leftLoad = bars[1].bounds.max.y - bars[1].bounds.min.y;
    const rightLoad = bars[3].bounds.max.y - bars[3].bounds.min.y;

    let mood = "neutral";
    if (psychHeight > 160) mood = "happy";
    else if (psychHeight < 80) mood = "sad";

    let load = "";
    if (leftLoad < rightLoad - 10) load = "leftweight";
    else if (rightLoad < leftLoad - 10) load = "rightweight";
    else if (rightLoad < 0.8 && leftLoad < 0.8) load = "bothweights";

    const key = load ? `${load}${mood !== "neutral" ? "_" + mood : ""}` : mood;
    const img = images[key] || images.neutral;

    if (img.complete && img.width) {
      const w = img.width * 0.2;
      const h = img.height * 0.2;

      context.save();
      context.translate(platform.position.x, platform.position.y);
      context.rotate(platform.angle);
      context.drawImage(img, -w / 2, -h - 10, w, h);
      context.restore();
    }
  }
  animate();
})();

// submitForm bleibt unverändert




function submitForm() {
  const form = document.forms["userForm"];
  const job = form.job.value;

  const hometown = form.hometown.value;
  const elderly = document.getElementById("elderlyYes").checked;
  const inHome = form.inHome?.checked || false;
const hasChildren = document.getElementById("childrenYes").checked;
const childrenCount = parseInt(document.getElementById("childrenCount")?.value || 0);
const childrenInKita = parseInt(form.childrenInKita?.value || 0);

  // 🔒 Verhindere Fortfahren bei unvollständiger Auswahl
  if (job === "default1" || hometown === "default") {
    alert("Please select a city and occupation before proceeding.");
    return;
  }

  const hobbies = Array.from(document.querySelectorAll("input[name='hobbies']:checked")).map(e => e.value);

  // Event-Häufigkeit über Checkbox
  let eventFrequency = "";
  const eventFreqChecked = document.querySelector("input[name='eventFrequency']:checked");
  if (eventFreqChecked) {
    eventFrequency = eventFreqChecked.value.toLowerCase();
  }

  const bildung = document.getElementById("bildungYes")?.checked || false;
  const mentalSupport = document.getElementById("mentalSupportYes")?.checked || false;
  const socialGroup = document.getElementById("socialGroupYes")?.checked || false;

  // ✨ Klar benannte Säulenwerte
  let pillarValues = {
    finance: 300,
    social: 200,
    mental: 200,
    self: 200,
    health: 300
  };

  // Beruf & Alter
  if (job === "student") pillarValues.finance -= 20;


  // Zusatzfragen
  if (bildung) pillarValues.self -= 10;
  if (mentalSupport) pillarValues.mental -= 10;
  if (socialGroup) pillarValues.social -= 10;

  // Familie
if (elderly) {
  const isStudent = job === "student";

  const careModifiers = isStudent
    ? {
        finance: 4,
        social: 6,
        mental: 8,
        self: 5,
        health: 3
      }
    : {
        finance: 2,
        social: 4,
        mental: 7,
        self: 6,
        health: 4
      };

  // Werte anwenden
  for (const key in careModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= careModifiers[key];
    }
  }
}




  const isStudent = job === "student";

  const childModifiers = isStudent
    ? {
        finance: 0,
        social: 3,
        mental: 3,
        self: 2,
        health: 1
      }
    : {
        finance: 0,
        social: 2,
        mental: 2,
        self: 1,
        health: 1
      };

  // Verstärkungsfaktor abhängig von Kinderanzahl
  let multiplier = 1;
  if (childrenInKita >= 3) {
    multiplier = 2;
  } else if (childrenInKita === 2) {
    multiplier = 1.5;
  }

  // Werte anwenden
  for (const key in childModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= childModifiers[key] * multiplier;
    }
  }



if (eventFrequency) {
  const isStudent = job === "student";

  const eventModifiers = isStudent
    ? {
        finance: 2,
        social: 6,
        mental: 5,
        self: 4,
        health: 2
      }
    : {
        finance: 1,
        social: 4,
        mental: 4,
        self: 3,
        health: 1
      };

  // Häufigkeit: Gewichtungsfaktor setzen
  const frequencyFactors = {
    monthly: 1,
    weekly: 1.5,
    daily: 2
  };

  const multiplier = frequencyFactors[eventFrequency] || 1;

  // Werte anwenden – multipliziert
  for (const key in eventModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= eventModifiers[key] * multiplier;
    }
  }
}


const attendsWorkshops = document.getElementById("bildungYes")?.checked;

if (attendsWorkshops) {
  const isStudent = job === "student";

  const workshopModifiers = isStudent
    ? {
        finance: 2,
        social: 5,
        mental: 6,
        self: 5,
        health: 2
      }
    : {
        finance: 1,
        social: 3,
        mental: 4,
        self: 3,
        health: 1
      };

  for (const key in workshopModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= workshopModifiers[key];
    }
  }
}
if (mentalSupport) {

  const isStudent = job === "student";

  const supportGroupModifiers = isStudent
    ? {
        finance: 2,
        social: 5,
        mental: 7,
        self: 5,
        health: 3
      }
    : {
        finance: 1,
        social: 3,
        mental: 4,
        self: 3,
        health: 1
      };

  // Werte anwenden
  for (const key in supportGroupModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= supportGroupModifiers[key];
    }
  }
}

if (socialGroup) {
  const isStudent = job === "student";

  const clubModifiers = isStudent
    ? {
        finance: 2,
        social: 6,
        mental: 5,
        self: 4,
        health: 2
      }
    : {
        finance: 1,
        social: 3,
        mental: 3,
        self: 2,
        health: 1
      };

  // Werte anwenden
  for (const key in clubModifiers) {
    if (pillarValues.hasOwnProperty(key)) {
      pillarValues[key] -= clubModifiers[key];
    }
  }
}


const cityModifiers = {
  "Berlin": {
    finance: 2,    // z. B. günstige Kulturangebote/Studihilfe fällt weg
    social: 6,     // kulturelle & studentische Events ohne Ehrenamt
    mental: 6,     // Stresspuffer durch Gruppenaktivitäten entfällt
    self: 8,       // weniger Zugang zu kreativen/kulturellen Mitmachangeboten
    health: 3      // keine kostenlose Gesundheits-/Beratungsangebote
  },
  "Frankfurt": {
    finance: 3,
    social: 8,     // ohne Ehrenamt z. B. kein Buddy-Programm, Mentoren, Sprachcafés
    mental: 5,
    self: 5,
    health: 6
  },
  "München": {
    finance: 2,
    social: 6,
    mental: 4,
    self: 9,       // Vereine/Sportgruppen sehr aktiv & ehrenamtlich getragen
    health: 2
  },
  "Hamburg": {
    finance: 2,
    social: 9,     // soziale Projekte auch für Studierende stark verbreitet
    mental: 7,
    self: 6,
    health: 4
  },
  "Köln": {
    finance: 3,
    social: 7,
    mental: 6,
    self: 6,
    health: 5
  }
};


  const mod = cityModifiers[hometown];
  if (mod) {
    for (const key in mod) {
      if (pillarValues.hasOwnProperty(key)) {
        pillarValues[key] -= mod[key];
      }
    }
  }

  // Reihenfolge für updateBars()
  const values = [
    pillarValues.finance,
    pillarValues.social,
    pillarValues.mental,
    pillarValues.self,
    pillarValues.health
  ];

  updateBars(values);

  // 🔽 Individueller Erklärungstext anzeigen
  const pillarScores = { ...pillarValues };
const inputFlags = {
  hometown,
  hasChildren,
  childrenInKita,
  elderly,
  inHome,
  mentalSupport,
  socialGroup,
  hobbies,
  eventFrequency,
  bildung
};

const explanation = generateExplanation(pillarScores, inputFlags);

  document.getElementById("explanationBox").innerHTML = explanation;

}



let collapsed = false;
document.getElementById("toggleCollapse").addEventListener("click", () => {
  if (!collapsed) {
    submitForm();
    collapsed = true;
    document.getElementById("toggleCollapse").textContent = "BRING THEM BACK";
  } else {
    updateBars(defaultHeights);
    collapsed = false;
    document.getElementById("toggleCollapse").textContent = "LET THEM DISAPPEAR";
  }
});
document.getElementById("toggleCollapse").addEventListener("click", function() {
  this.classList.toggle("active"); // ⬅ Umschalten der Klasse
});

// Collapse toggle for info panels
document.querySelectorAll(".pillar-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (target) {
      target.classList.toggle("hidden");
      button.textContent = target.classList.contains("hidden") ? "+" : "−";
    }
  });
});




function generateExplanation(pillarScores, input) {
  const labels = {
    finance: "Everyday support",
    social: "Social life",
    mental: "Mental health",
    self: "Personal growth",
    health: "Health & care"
  };

  // 1. Schwächste Säule ermitteln
  const weakestKey = Object.entries(pillarScores).reduce((minKey, [key, value]) =>
    value < pillarScores[minKey] ? key : minKey,
    Object.keys(pillarScores)[0]
  );
  const weakestLabel = labels[weakestKey];

  // 2. Erklärung für die schwächste Säule
  let reasons = [];

  if (weakestKey === "mental") {
    if (!input.hobbies.length) reasons.push("no hobbies selected");
    if (!input.mentalSupport) reasons.push("no mental support available");
    if (!input.eventFrequency) reasons.push("no regular event participation");
  }
  if (weakestKey === "social") {
    if (!input.socialGroup) reasons.push("no social group engagement");
    if (!input.hobbies.includes("Choir") && !input.hobbies.includes("Theater")) reasons.push("few community-related hobbies");
    if (!input.eventFrequency) reasons.push("no events attended");
  }
  if (weakestKey === "finance") {
    if (input.hasChildren && input.childrenInKita > 0) reasons.push("childcare needs with limited support");
    if (input.elderly) reasons.push("elderly relatives create household responsibilities");
  }
  if (weakestKey === "health") {
    if (input.elderly && input.inHome) reasons.push("caring for elderly in home");
  }
  if (weakestKey === "self") {
    if (!input.bildung) reasons.push("no ongoing education");
    if (!input.hobbies.includes("Yoga") && !input.hobbies.includes("Gym")) reasons.push("few self-care hobbies");
  }

  let text = `Most affected area: <strong>${weakestLabel}</strong><br><br>\n`;

  const shortIntro = {
    finance: "Your everyday life is especially affected due to financial or care-related responsibilities.",
    social: "Your social stability is especially affected because of limited group engagement and social contact.",
    mental: "Your mental balance is especially vulnerable due to missing emotional support or stimulating activities.",
    self: "Your opportunities for personal growth and self-care are particularly impacted by limited hobbies or education.",
    health: "Your health-related stability is weakened due to care responsibilities or reduced access to support services."
  };

  text += `${shortIntro[weakestKey]}<br><br>`;

  if (reasons.length > 0) {
    text += `Reason: ${reasons.join(", ")}.<br><br>`;
  } else {
    text += `This area is affected despite relatively balanced answers – possibly due to indirect influences.<br><br>`;
  }

  // 3. Differenzierte Gesamtbetrachtung
  let details = [];

  // 📍 Städte-Block
  if (input.hometown) {
    details.push(`You live in <strong>${input.hometown}</strong>, where volunteer-driven services have an above-average impact on everyday life — including access to cultural, social or psychological support services <a href='#ref9'>[9]</a>, <a href='#ref10'>[10]</a>.`);
  }

  // 👶 Kinder
  if (!input.hasChildren) {
    details.push("Not having children reduced stress and care-related needs.");
  } else if (input.childrenInKita > 0) {
    details.push(`Your ${input.childrenInKita} child(ren) in daycare rely in part on volunteer-supported services such as extracurricular activities or community involvement <a href='#ref44'>[44]</a>, even though core childcare itself remains stable without volunteers <a href='#ref43'>[43]</a>.`);
  } else {
    details.push("Having children increased your emotional and organizational load — but core support systems were not volunteer-based <a href='#ref43'>[43]</a>.");
  }

  // 👵 Pflege
  if (!input.elderly) {
    details.push("No elderly relatives meant less care-related dependency.");
  } else if (!input.inHome) {
    details.push("You have elderly relatives, but they don't live in your home — this limited the overall impact <a href='#ref12'>[12]</a>.");
  } else {
    details.push("You care for elderly relatives at home — which raises health and self-care pressures significantly <a href='#ref12'>[12]</a>.");
  }

  // 📅 Events
  if (input.eventFrequency) {
    details.push("Regular event attendance offered emotional and social stability <a href='#ref36'>[36]</a>.");
  } else {
    details.push("Lack of regular event participation reduced opportunities for emotional balance and social interaction <a href='#ref36'>[36]</a>.");
  }

  // 💬 Support
  if (input.mentalSupport) {
    details.push("Access to mental support groups helped buffer stress and improve resilience <a href='#ref39'>[39]</a>.");
  }

  // 👥 Gruppen
  if (input.socialGroup) {
    details.push("Involvement in social or student groups stabilized your social network <a href='#ref41'>[41]</a>.");
  }

  // 🎓 Bildung
  if (input.bildung) {
    details.push("Your participation in workshops or language cafés supported personal growth and integration <a href='#ref37'>[37]</a>.");
  }

  // 🧩 Hobbies
  if (!input.hobbies.length) {
    details.push("Having no hobbies reduced your resilience and self-expression.");
  }

  text += details.join(" ");

  // Illustration anzeigen
  const imageMap = {
    finance: "figuren/finance.png",
    social: "figuren/socialint.png",
    mental: "figuren/mental.png",
    self: "figuren/self.png",
    health: "figuren/health.png"
  };

  const imgSrc = imageMap[weakestKey];
  if (imgSrc) {
    const visualContainer = document.getElementById("explanationVisual");
    visualContainer.innerHTML = `<img src="${imgSrc}" alt="${weakestLabel}" style="max-width: 140px; margin-bottom: 1rem;" />`;
  }

  return text;
}


function handleEventsCheckbox(value) {
  const yes = document.getElementById("eventsYes");
  const no = document.getElementById("eventsNo");
  const followup = document.getElementById("eventsFollowup");
  if (value === 'yes') {
    if (yes.checked) {
      no.checked = false;
      followup.style.display = 'block';
    } else {
      followup.style.display = 'none';
    }
  } else {
    if (no.checked) {
      yes.checked = false;
      followup.style.display = 'none';
    }
  }
}
function selectOnlyOne(checkbox) {
  const checkboxes = document.querySelectorAll("input[name='eventFrequency']");
  checkboxes.forEach(cb => {
    if (cb !== checkbox) cb.checked = false;
  });
}
// Automatisch Animation zurücksetzen bei jeder Änderung im Formular
const form = document.getElementById("userForm");

form.addEventListener("input", () => {
  collapsePillars(); // ← oder dein tatsächlicher Funktionsname
});
function collapsePillars() {
  updateBars(defaultHeights);
  collapsed = false;
  const btn = document.getElementById("toggleCollapse");
  btn.textContent = "LET THEM DISAPPEAR";
  btn.classList.remove("active");
}
// Gegenseitiges Ausschließen für Ja/Nein-Checkboxen
document.querySelectorAll(".yn-toggle").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const group = checkbox.dataset.group;
      document.querySelectorAll(`.yn-toggle[data-group="${group}"]`).forEach((cb) => {
        if (cb !== checkbox) cb.checked = false;
      });
    }
  });
});
