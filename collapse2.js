let institutions = [];

document.addEventListener("DOMContentLoaded", () => {
  // JSON-Daten laden
  fetch("institutions.json")
    .then(response => response.json())
    .then(data => {
      institutions = data;
    });

  // Zeitwahl
  document.querySelectorAll(".time-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".time-option").forEach(el => el.classList.remove("selected"));
      option.classList.add("selected");

      const selectedValue = option.dataset.value;
      const output = document.querySelector(".selected-output");
      if (output) {
        output.textContent = `${selectedValue} hours per week for my volunteer work.`;
      }

      checkAllInputsAnswered(); // <== HIER
    });
  });

  // Städte-Vorschläge
  const cities = {
    "Berlin": "images/berlin.png",
    "Cologne": "images/cologne.png",
    "Hamburg": "images/hamburg.png",
    "Munich": "images/munich.png",
    "Düsseldorf": "images/düsseldorf.png"
  };

  const cityInput = document.getElementById("city-input");
  const suggestionList = document.getElementById("city-suggestions");
  const cityImage = document.getElementById("city-image");

  cityInput.addEventListener("input", () => {
    const input = cityInput.value.toLowerCase();
    const matches = Object.keys(cities).filter(city =>
      city.toLowerCase().includes(input)
    );

    suggestionList.innerHTML = "";
    if (matches.length > 0 && input.length > 0) {
      matches.forEach(city => {
        const item = document.createElement("li");
        item.textContent = city;
        suggestionList.appendChild(item);
      });
      suggestionList.classList.remove("hidden");
    } else {
      suggestionList.classList.add("hidden");
    }

    checkAllInputsAnswered(); // <== HIER
  });

  suggestionList.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const city = e.target.textContent;
      cityInput.value = city;
      suggestionList.classList.add("hidden");

      const imageUrl = cities[city];
      if (imageUrl) {
        cityImage.src = imageUrl;
        cityImage.classList.remove("hidden");
      }

      checkAllInputsAnswered(); // <== HIER
    }
  });

  // Säulen: Auswahl ein-/ausschalten
  document.querySelectorAll(".core").forEach(el => {
    el.classList.add("initial");

    el.addEventListener("click", () => {
      el.classList.toggle("expanded");

      if (el.classList.contains("expanded")) {
        el.classList.remove("initial");
        el.classList.add("colored");
      } else {
        el.classList.remove("colored");
        el.classList.add("initial");
      }

      checkAllInputsAnswered(); // <== HIER
    });
  });

  // Ergebnisse anzeigen
  const scrollBtn = document.querySelector(".scroll-indicator a");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", showResults);
  }
});

// Ergebnisse filtern und anzeigen
function showResults() {
  const city = document.getElementById("city-input").value.trim().toLowerCase();
  const timeOption = document.querySelector(".time-option.selected")?.dataset.value?.trim().toLowerCase();
  const selectedCores = document.querySelectorAll(".core.expanded");
  const selectedPillars = Array.from(selectedCores).map(el =>
    el.parentElement.classList[1].trim().toLowerCase()
  );

  if (!city || !timeOption || selectedPillars.length === 0) {
    alert("Please select a city, time, and at least one pillar.");
    return;
  }

  const matches = institutions.filter(inst =>
    inst.cities.some(c => c.trim().toLowerCase() === city) &&
    (Array.isArray(inst.hours) ? inst.hours : [inst.hours])
      .some(h => h.trim().toLowerCase() === timeOption) &&
    inst.pillars.some(p => selectedPillars.includes(p.trim().toLowerCase()))
  );

  const container = document.getElementById("results-container");
  container.innerHTML = "";

  if (matches.length > 0) {
    const table = document.createElement("table");
    table.className = "results-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Matching Pillars</th>
          <th>Institution</th>
          <th>Description</th>
          <th>Website</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    matches.forEach(inst => {
      const row = document.createElement("tr");
      const colorDots = inst.pillars.map(pillar =>
        `<span class="legend-dot ${pillar}"></span>`
      ).join(" ");

      row.innerHTML = `
        <td>${colorDots}</td>
        <td>${inst.name}</td>
        <td>${inst.description || "No description available."}</td>
        <td><a href="${inst.link}" target="_blank">${inst.link}</a></td>
      `;

      tbody.appendChild(row);
    });

    container.appendChild(table);
  } else {
    container.textContent = "No matching results found.";
  }
}

// Button-Aktivierung prüfen
function checkAllInputsAnswered() {
  const city = document.getElementById("city-input").value.trim();
  const timeSelected = document.querySelector(".time-option.selected");
  const pillarsSelected = document.querySelectorAll(".core.expanded");

  const allAnswered = city !== "" && timeSelected && pillarsSelected.length > 0;

  const resultsBtn = document.getElementById("results-button");
  if (resultsBtn) {
    if (allAnswered) {
      resultsBtn.classList.add("active");
      resultsBtn.disabled = false;
    } else {
      resultsBtn.classList.remove("active");
      resultsBtn.disabled = true;
    }
  }
}
