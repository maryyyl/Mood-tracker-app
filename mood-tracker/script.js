const moods = {
  odlicno: {
    label: "Одлично",
    icon: "☀",
    color: "#4F7A6B",
    plant: "🌻",
    quotes: [
      "Задржи го ова чувство, го заслужуваш.",
      "Денес си доказ дека добрите денови постојат.",
      "Оваа енергија што ја носиш денес, носи ја понатаму.",
      "Убаво е да те гледам вака. Продолжи."
    ]
  },
  dobro: {
    label: "Добро",
    icon: "🌤",
    color: "#6F8F5C",
    plant: "🌼",
    quotes: [
      "Добриот ден не мора да биде совршен за да се брои.",
      "Мали чекори, стабилна насока.",
      "Ова е солидна основа за утре.",
      "Продолжи вака, тргнал си во вистинска насока."
    ]
  },
  neutralno: {
    label: "Во ред",
    icon: "☁",
    color: "#C9A24C",
    plant: "🌾",
    quotes: [
      "Не мора секој ден да е извонреден за да биде вреден.",
      "Во ред е да биде само во ред.",
      "Мирните денови исто носат вредност.",
      "Утре носи нова можност."
    ]
  },
  losho: {
    label: "Лошо",
    icon: "🌧",
    color: "#B0704F",
    plant: "🥀",
    quotes: [
      "Ова чувство е привремено, дури и кога не изгледа така.",
      "Во ред е денес да не биде добар ден.",
      "Биди трпелив со себе, направи го она што можеш.",
      "Секој тежок ден поминува, чекор по чекор."
    ]
  },
  uzhasno: {
    label: "Ужасно",
    icon: "⛈",
    color: "#8C5B6B",
    plant: "🌱",
    quotes: [
      "Ако денес само издржа, тоа е доволно.",
      "Не мора да се справиш со сè денес, само со следниот час.",
      "Дозволи си да го почувствуваш ова, без осудување.",
      "Побарај поддршка ако ти треба, не мораш сам да го носиш ова."
    ]
  }
};

const STORAGE_KEY = "moodTrackerEntries";

let selectedMood = null;

const moodButtons = document.querySelectorAll(".mood-btn");
const noteInput = document.getElementById("note");
const saveBtn = document.getElementById("saveBtn");
const quoteBox = document.getElementById("quoteBox");
const quoteText = document.getElementById("quoteText");
const historyList = document.getElementById("historyList");
const emptyState = document.getElementById("emptyState");
const gardenRow = document.getElementById("gardenRow");
const streakValue = document.getElementById("streakValue");
const totalValue = document.getElementById("totalValue");

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function pickQuote(moodKey) {
  const list = moods[moodKey].quotes;
  return list[Math.floor(Math.random() * list.length)];
}

moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMood = btn.dataset.mood;
    saveBtn.disabled = false;

    quoteText.textContent = pickQuote(selectedMood);
    quoteBox.hidden = false;
    quoteBox.style.borderLeftColor = moods[selectedMood].color;
  });
});

saveBtn.addEventListener("click", () => {
  if (!selectedMood) return;

  const entries = loadEntries();
  const now = new Date();

  entries.unshift({
    mood: selectedMood,
    note: noteInput.value.trim(),
    date: now.toISOString(),
  });

  saveEntries(entries);

  noteInput.value = "";
  moodButtons.forEach((b) => b.classList.remove("selected"));
  selectedMood = null;
  saveBtn.disabled = true;
  quoteBox.hidden = true;

  render();
});

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("mk-MK", { day: "numeric", month: "short", year: "numeric" });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function computeStreak(entries) {
  if (entries.length === 0) return 0;

  const days = [...new Set(entries.map((e) => {
    const d = new Date(e.date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }))].sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dayTime of days) {
    const day = new Date(dayTime);
    if (isSameDay(day, cursor)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (day.getTime() < cursor.getTime()) {
      break;
    }
  }

  return streak;
}

function renderGarden(entries) {
  gardenRow.innerHTML = "";

  if (entries.length === 0) {
    const note = document.createElement("p");
    note.className = "garden-empty-note";
    note.textContent = "Твојата градина сè уште е празна. Секој запис засадува нешто ново.";
    gardenRow.appendChild(note);
    return;
  }

  const recent = entries.slice(0, 20).reverse();
  recent.forEach((entry) => {
    const span = document.createElement("span");
    span.className = "garden-plant";
    span.title = `${moods[entry.mood].label} · ${formatDate(entry.date)}`;
    span.textContent = moods[entry.mood].plant;
    gardenRow.appendChild(span);
  });
}

function renderHistory(entries) {
  historyList.innerHTML = "";

  if (entries.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const dot = document.createElement("span");
    dot.className = "history-dot";
    dot.style.setProperty("--dot-color", moods[entry.mood].color);

    const body = document.createElement("div");
    body.className = "history-body";

    const top = document.createElement("div");
    top.className = "history-top";

    const moodLabel = document.createElement("span");
    moodLabel.className = "history-mood";
    moodLabel.textContent = `${moods[entry.mood].icon} ${moods[entry.mood].label}`;

    const dateLabel = document.createElement("span");
    dateLabel.textContent = formatDate(entry.date);

    top.appendChild(moodLabel);
    top.appendChild(dateLabel);
    body.appendChild(top);

    if (entry.note) {
      const note = document.createElement("p");
      note.className = "history-note";
      note.textContent = entry.note;
      body.appendChild(note);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "history-delete";
    deleteBtn.textContent = "Избриши";
    deleteBtn.addEventListener("click", () => {
      const current = loadEntries();
      current.splice(index, 1);
      saveEntries(current);
      render();
    });

    li.appendChild(dot);
    li.appendChild(body);
    li.appendChild(deleteBtn);
    historyList.appendChild(li);
  });
}

function render() {
  const entries = loadEntries();
  totalValue.textContent = entries.length;
  streakValue.textContent = computeStreak(entries);
  renderGarden(entries);
  renderHistory(entries);
}

render();
