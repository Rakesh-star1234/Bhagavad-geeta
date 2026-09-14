"use strict";

/* =========================================================
   BHAGAVAD GITA WEBSITE
   JavaScript
   Built by Rakesh Kumar
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const API_BASE = "https://vedicscriptures.github.io";


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {
  chapters: [],
  activeChapter: null,
  activeVerse: null,
  activeTab: "sanskrit",
  verseData: null
};

window.state = state;


/* =========================================================
   FALLBACK CHAPTERS
   ========================================================= */

const FALLBACK_CHAPTERS = Array.from(
  { length: 18 },
  (_, i) => ({
    chapter_number: i + 1,
    name: "अध्याय " + (i + 1),
    translation: "Chapter " + (i + 1),
    verses_count: null
  })
);


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const tocList =
  document.getElementById("toc-list");

const chapterHead =
  document.getElementById("chapter-header");

const versePicker =
  document.getElementById("verse-picker");

const verseContent =
  document.getElementById("verse-content");

const searchForm =
  document.getElementById("search-form");

const searchInput =
  document.getElementById("search-input");

const searchHint =
  document.getElementById("search-hint");


/* =========================================================
   HERO SUN RAYS
   ========================================================= */

function initHeroRays() {

  const raysGroup =
    document.getElementById("rays");

  if (!raysGroup) {
    return;
  }

  const cx = 450;
  const cy = 380;
  const rInner = 150;
  const rOuter = 300;
  const count = 24;

  let html = "";

  for (let i = 0; i < count; i++) {

    const angle =
      (i / count) * 2 * Math.PI;

    const x1 =
      cx + rInner * Math.cos(angle);

    const y1 =
      cy + rInner * Math.sin(angle);

    const x2 =
      cx + rOuter * Math.cos(angle);

    const y2 =
      cy + rOuter * Math.sin(angle);

    html += `
      <line
        x1="${x1.toFixed(1)}"
        y1="${y1.toFixed(1)}"
        x2="${x2.toFixed(1)}"
        y2="${y2.toFixed(1)}"
      />
    `;
  }

  raysGroup.innerHTML = html;
}


/* =========================================================
   HERO VERSE
   ========================================================= */

async function loadHeroVerse() {

  try {

    const response =
      await fetch(
        `${API_BASE}/slok/2/47`
      );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data =
      await response.json();

    const firstLine =
      (data.slok || "")
        .split("\n")[0];

    const box =
      document.getElementById(
        "hero-verse"
      );

    const text =
      document.getElementById(
        "hero-verse-text"
      );

    const reference =
      document.getElementById(
        "hero-verse-ref"
      );

    if (!box || !text || !reference) {
      return;
    }

    text.textContent = firstLine;

    reference.textContent =
      "Bhagavad Gita, Chapter 2, Verse 47";

    box.classList.remove("hidden");

  } catch (error) {

    console.log(
      "Hero verse could not be loaded."
    );
  }
}


/* =========================================================
   LOAD CHAPTERS
   ========================================================= */

async function loadChapters() {

  try {

    const response =
      await fetch(
        `${API_BASE}/chapters`
      );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data =
      await response.json();

    state.chapters =
      data.sort(
        (a, b) =>
          a.chapter_number -
          b.chapter_number
      );

  } catch (error) {

    state.chapters =
      FALLBACK_CHAPTERS;
  }

  renderTOC();

  selectChapter(1);
}


/* =========================================================
   RENDER CHAPTER LIST
   ========================================================= */

function renderTOC() {

  if (!tocList) {
    return;
  }

  tocList.innerHTML = "";

  state.chapters.forEach(
    (chapter) => {

      const li =
        document.createElement("li");

      li.className =
        "toc-row border-l-4 border-transparent";

      li.dataset.chapter =
        chapter.chapter_number;

      const count =
        chapter.verses_count
          ? `${chapter.verses_count} verses`
          : "";

      li.innerHTML = `
        <button
          class="w-full text-left px-4 py-3 flex items-baseline gap-3 hover:bg-saffron/10 transition-colors"
        >

          <span
            class="font-display text-maroon/70 text-sm w-5 shrink-0"
          >
            ${chapter.chapter_number}
          </span>

          <span class="min-w-0">

            <span
              class="block font-display text-ink truncate"
            >
              ${chapter.name || "—"}
            </span>

            <span
              class="block text-xs text-ink/50 truncate"
            >
              ${chapter.translation || ""}
              ${count ? " · " + count : ""}
            </span>

          </span>

        </button>
      `;

      li
        .querySelector("button")
        .addEventListener(
          "click",
          () =>
            selectChapter(
              chapter.chapter_number
            )
        );

      tocList.appendChild(li);
    }
  );
}


/* =========================================================
   ACTIVE CHAPTER
   ========================================================= */

function markActiveChapterRow(
  chapterNumber
) {

  document
    .querySelectorAll(".toc-row")
    .forEach((row) => {

      row.classList.toggle(
        "active",
        Number(
          row.dataset.chapter
        ) === chapterNumber
      );

    });
}


/* =========================================================
   SELECT CHAPTER
   ========================================================= */

function selectChapter(
  chapterNumber
) {

  const chapter =
    state.chapters.find(
      (item) =>
        item.chapter_number ===
        chapterNumber
    );

  state.activeChapter =
    chapterNumber;

  markActiveChapterRow(
    chapterNumber
  );


  if (chapterHead) {

    chapterHead.innerHTML = `
      <p
        class="text-sm text-saffronDeep font-medium"
      >
        Chapter ${chapterNumber}
      </p>

      <h3
        class="font-display text-2xl text-maroon"
      >
        ${chapter?.name || ""}
      </h3>

      <p class="text-ink/70">
        ${chapter?.translation || ""}
        ${
          chapter?.meaning?.en
            ? " — " +
              chapter.meaning.en
            : ""
        }
      </p>

      ${
        chapter?.summary?.en
          ? `
            <p
              class="mt-2 text-sm text-ink/60 max-w-2xl"
            >
              ${chapter.summary.en}
            </p>
          `
          : ""
      }
    `;
  }


  const count =
    chapter?.verses_count || 1;

  if (versePicker) {

    versePicker.innerHTML = "";

    for (
      let verse = 1;
      verse <= count;
      verse++
    ) {

      const button =
        document.createElement(
          "button"
        );

      button.textContent =
        verse;

      button.className =
        "verse-pill text-sm w-9 h-9 flex items-center justify-center rounded-full border border-saffron/40 text-ink/70 hover:border-maroon transition-colors";

      button.dataset.verse =
        verse;

      button.addEventListener(
        "click",
        () =>
          loadVerse(
            chapterNumber,
            verse
          )
      );

      versePicker.appendChild(
        button
      );
    }
  }

  loadVerse(
    chapterNumber,
    1
  );
}


/* =========================================================
   ACTIVE VERSE
   ========================================================= */

function markActiveVersePill(
  verseNumber
) {

  if (!versePicker) {
    return;
  }

  versePicker
    .querySelectorAll(
      ".verse-pill"
    )
    .forEach((button) => {

      button.classList.toggle(
        "active",
        Number(
          button.dataset.verse
        ) === verseNumber
      );

    });
}


/* =========================================================
   LOAD VERSE FROM API
   ========================================================= */

async function loadVerse(
  chapterNumber,
  verseNumber
) {

  state.activeChapter =
    chapterNumber;

  state.activeVerse =
    verseNumber;


  document.dispatchEvent(
    new CustomEvent(
      "gita:verse",
      {
        detail: {
          chapter:
            chapterNumber,

          verse:
            verseNumber
        }
      }
    )
  );


  markActiveChapterRow(
    chapterNumber
  );

  markActiveVersePill(
    verseNumber
  );


  if (verseContent) {

    verseContent.innerHTML = `
      <p class="text-ink/40 animate-pulse">
        Loading verse
        ${chapterNumber}.${verseNumber}…
      </p>
    `;
  }


  try {

    const response =
      await fetch(
        `${API_BASE}/slok/${chapterNumber}/${verseNumber}`
      );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data =
      await response.json();

    renderVerse(
      chapterNumber,
      verseNumber,
      data
    );

  } catch (error) {

    if (!verseContent) {
      return;
    }

    verseContent.innerHTML = `
      <div class="text-sm text-maroon">

        <p>
          This verse didn't load.
          Check your connection and try again.
        </p>

        <button
          id="retry-verse"
          class="mt-3 rounded-md border border-maroon px-4 py-2 hover:bg-maroon hover:text-paper transition-colors"
        >
          Try again
        </button>

      </div>
    `;

    const retry =
      document.getElementById(
        "retry-verse"
      );

    if (retry) {

      retry.addEventListener(
        "click",
        () =>
          loadVerse(
            chapterNumber,
            verseNumber
          )
      );
    }
  }
}


/* =========================================================
   RENDER VERSE DATA
   ========================================================= */

function renderVerse(
  chapterNumber,
  verseNumber,
  data
) {

  const hindi = {

    text:
      data.tej?.ht ||
      data.rams?.ht ||
      data.raman?.ht ||
      null,

    author:
      data.tej?.ht
        ? "Swami Tejomayananda"
        : data.rams?.ht
        ? "Swami Ramsukhdas"
        : "Swami Ramanuja"
  };


  let english = {

    text:
      data.siva?.et ||
      null,

    author:
      data.siva?.et
        ? "Swami Sivananda"
        : null
  };


  if (!english.text) {

    const alternatives = [

      [
        "purohit",
        "Shri Purohit Swami"
      ],

      [
        "adi",
        "Swami Adidevananda"
      ],

      [
        "gambir",
        "Swami Gambirananda"
      ],

      [
        "san",
        "Dr. S. Sankaranarayan"
      ]

    ];


    const found =
      alternatives.find(
        ([key]) =>
          data[key]?.et
      );


    if (found) {

      english = {

        text:
          data[found[0]].et,

        author:
          found[1]
      };

    } else {

      english = {

        text: null,

        author: null
      };
    }
  }


  state.verseData = {

    chapterNumber,

    verseNumber,

    data,

    hindi,

    english
  };


  state.activeTab =
    "sanskrit";


  renderTabs();
}


/* =========================================================
   RENDER LANGUAGE TABS
   ========================================================= */

function renderTabs() {

  if (!state.verseData) {
    return;
  }

  const {
    chapterNumber,
    verseNumber,
    data,
    hindi,
    english
  } = state.verseData;


  const tab =
    state.activeTab;


  const tabsBar = `
    <div
      class="flex gap-6 border-b border-saffron/25 mb-5"
      role="tablist"
      aria-label="Verse language"
    >

      <button
        class="tab-underline pb-2 text-sm font-medium ${
          tab === "sanskrit"
            ? "active"
            : "text-ink/50"
        }"
        data-tab="sanskrit"
      >
        Sanskrit
      </button>

      <button
        class="tab-underline pb-2 text-sm font-medium ${
          tab === "hindi"
            ? "active"
            : "text-ink/50"
        }"
        data-tab="hindi"
      >
        Hindi
      </button>

      <button
        class="tab-underline pb-2 text-sm font-medium ${
          tab === "english"
            ? "active"
            : "text-ink/50"
        }"
        data-tab="english"
      >
        English
      </button>

    </div>
  `;


  let body = "";


  if (tab === "sanskrit") {

    body = `

      <p
        class="font-display text-xl text-ink devanagari-line whitespace-pre-line"
      >
        ${
          data.slok ||
          "Not available for this verse."
        }
      </p>

      ${
        data.transliteration
          ? `
            <p
              class="mt-4 text-ink/60 italic whitespace-pre-line"
            >
              ${data.transliteration}
            </p>
          `
          : ""
      }

    `;


  } else if (tab === "hindi") {

    body =
      hindi.text
        ? `

          <p
            class="text-lg leading-relaxed devanagari-line"
          >
            ${hindi.text}
          </p>

          <p
            class="mt-3 text-sm text-maroon/70"
          >
            — ${hindi.author}
          </p>

        `
        : `

          <p
            class="text-ink/50 italic"
          >
            A Hindi translation isn't
            available for this verse yet.
          </p>

        `;


  } else {

    body =
      english.text
        ? `

          <p
            class="text-lg leading-relaxed"
          >
            ${english.text}
          </p>

          <p
            class="mt-3 text-sm text-maroon/70"
          >
            — ${english.author}
          </p>

        `
        : `

          <p
            class="text-ink/50 italic"
          >
            An English translation isn't
            available for this verse yet.
          </p>

        `;
  }


  const chapter =
    state.chapters.find(
      (item) =>
        item.chapter_number ===
        chapterNumber
    );


  const count =
    chapter?.verses_count ||
    verseNumber;


  const navigation = `

    <div
      class="mt-8 pt-5 border-t border-saffron/20 flex items-center justify-between text-sm"
    >

      <button
        id="prev-verse"
        ${
          verseNumber <= 1
            ? "disabled"
            : ""
        }
        class="text-maroon disabled:text-ink/25 disabled:cursor-not-allowed hover:underline"
      >
        Previous verse
      </button>


      <span class="text-ink/40">
        Chapter ${chapterNumber},
        Verse ${verseNumber}
      </span>


      <button
        id="next-verse"
        ${
          verseNumber >= count
            ? "disabled"
            : ""
        }
        class="text-maroon disabled:text-ink/25 disabled:cursor-not-allowed hover:underline"
      >
        Next verse
      </button>

    </div>

  `;


  verseContent.innerHTML =
    tabsBar +
    body +
    navigation;


  verseContent
    .querySelectorAll(
      "[data-tab]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            state.activeTab =
              button.dataset.tab;

            renderTabs();
          }
        );

      }
    );


  const previous =
    document.getElementById(
      "prev-verse"
    );


  const next =
    document.getElementById(
      "next-verse"
    );


  if (previous) {

    previous.addEventListener(
      "click",
      () =>
        loadVerse(
          chapterNumber,
          verseNumber - 1
        )
    );
  }


  if (next) {

    next.addEventListener(
      "click",
      () =>
        loadVerse(
          chapterNumber,
          verseNumber + 1
        )
    );
  }
}


/* =========================================================
   SEARCH / JUMP
   ========================================================= */

if (searchForm) {

  searchForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const raw =
        searchInput.value.trim();


      const match =
        raw.match(
          /^(\d{1,2})\s*[.:,\s]\s*(\d{1,3})$/
        );


      if (!match) {

        searchHint.textContent =
          "Enter a chapter and verse number, like 2.47 for Chapter 2, Verse 47.";

        return;
      }


      const chapter =
        Number(match[1]);

      const verse =
        Number(match[2]);


      if (
        chapter < 1 ||
        chapter > 18
      ) {

        searchHint.textContent =
          "The Gita has chapters 1 through 18 — try again.";

        return;
      }


      searchHint.textContent =
        "";


      const library =
        document.getElementById(
          "library"
        );


      if (library) {

        library.scrollIntoView({
          behavior: "smooth"
        });
      }


      selectChapter(
        chapter
      );


      setTimeout(
        () =>
          loadVerse(
            chapter,
            verse
          ),
        200
      );
    }
  );
}


/* =========================================================
   ADVANCED LOCAL STORAGE
   ========================================================= */

const STORE =
  "gitaAdvancedV2";


let prefs =
  JSON.parse(
    localStorage.getItem(
      STORE
    ) || "{}"
  );


prefs.saved =
  prefs.saved || [];


prefs.read =
  prefs.read || [];


prefs.streak =
  prefs.streak || {
    last: "",
    count: 0
  };


prefs.chapters =
  prefs.chapters || [];


function saveData() {

  localStorage.setItem(
    STORE,
    JSON.stringify(
      prefs
    )
  );

  updateDashboard();
}


function today() {

  return new Date()
    .toISOString()
    .slice(0, 10);
}


/* =========================================================
   STREAK
   ========================================================= */

function updateStreak() {

  const current =
    today();

  const last =
    prefs.streak.last;


  if (
    current !== last
  ) {

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );


    const yesterdayString =
      yesterday
        .toISOString()
        .slice(0, 10);


    if (
      last ===
      yesterdayString
    ) {

      prefs.streak.count++;

    } else {

      prefs.streak.count =
        1;
    }


    prefs.streak.last =
      current;


    localStorage.setItem(
      STORE,
      JSON.stringify(
        prefs
      )
    );
  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const saved =
    prefs.saved.length;

  const read =
    prefs.read.length;


  const savedCount =
    document.getElementById(
      "savedCount"
    );

  const dashSaved =
    document.getElementById(
      "dashSaved"
    );

  const dashRead =
    document.getElementById(
      "dashRead"
    );

  const dashStreak =
    document.getElementById(
      "dashStreak"
    );


  if (savedCount) {

    savedCount.textContent =
      saved;
  }


  if (dashSaved) {

    dashSaved.textContent =
      saved;
  }


  if (dashRead) {

    dashRead.textContent =
      read;
  }


  if (dashStreak) {

    dashStreak.textContent =
      prefs.streak.count || 0;
  }


  const percent =
    Math.min(
      100,
      Math.round(
        (prefs.chapters.length /
          18) *
          100
      )
    );


  const journeyPercent =
    document.getElementById(
      "journeyPercent"
    );

  const journeyBar =
    document.getElementById(
      "journeyBar"
    );


  if (journeyPercent) {

    journeyPercent.textContent =
      percent + "%";
  }


  if (journeyBar) {

    journeyBar.style.width =
      percent + "%";
  }
}


updateStreak();

updateDashboard();


/* =========================================================
   DAILY WISDOM
   ========================================================= */

const dailyWisdom = [

  [
    "2.47",
    "Focus on your action, not only on the result.",
    "Do your best work today; let the outcome follow its own path."
  ],

  [
    "2.48",
    "Stay balanced in success and failure.",
    "A calm mind makes better decisions."
  ],

  [
    "6.5",
    "Lift yourself through your own effort.",
    "Small disciplined steps can change your direction."
  ],

  [
    "12.13",
    "Practice kindness and freedom from unnecessary hatred.",
    "Be firm in your values without carrying anger."
  ],

  [
    "18.66",
    "Surrender your deepest fear and seek what is right.",
    "When confused, return to your core values."
  ]

];


const todayWisdom =
  dailyWisdom[
    new Date().getDate() %
    dailyWisdom.length
  ];


const dailyTitle =
  document.getElementById(
    "dailyTitle"
  );


const dailyText =
  document.getElementById(
    "dailyText"
  );


if (dailyTitle) {

  dailyTitle.textContent =
    "Verse " +
    todayWisdom[0];
}


if (dailyText) {

  dailyText.textContent =
    todayWisdom[1] +
    " " +
    todayWisdom[2];
}


/* =========================================================
   REAL LIFE PRACTICE
   ========================================================= */

const lifeIdeas = [

  "Before starting an important task, spend two quiet minutes deciding what is actually in your control.",

  "When a result worries you, write down the next action you can take instead of repeatedly thinking about the outcome.",

  "If anger rises, delay your reply. A short pause can protect a long relationship.",

  "Do one difficult task without checking your phone. Practice attention before chasing productivity.",

  "Compare yourself with yesterday's version of yourself, not with everyone around you."

];


let lifeIndex =
  Number(
    localStorage.getItem(
      "gitaLifeIndex"
    ) || 0
  ) %
  lifeIdeas.length;


const lifeText =
  document.getElementById(
    "lifeText"
  );


if (lifeText) {

  lifeText.textContent =
    lifeIdeas[lifeIndex];
}


const newLifeButton =
  document.getElementById(
    "newLifeBtn"
  );


if (newLifeButton) {

  newLifeButton.onclick =
    () => {

      lifeIndex =
        (lifeIndex + 1) %
        lifeIdeas.length;


      localStorage.setItem(
        "gitaLifeIndex",
        lifeIndex
      );


      if (lifeText) {

        lifeText.textContent =
          lifeIdeas[lifeIndex];
      }
    };
}


/* =========================================================
   FEELING / WISDOM FINDER
   ========================================================= */

const feelings = {

  confused: [
    "2.47",
    "When your mind is confused, return to your duty and the action in front of you.",
    "Start with one clear step. You do not need the whole future to begin."
  ],

  sad: [
    "6.5",
    "Use your own mind as a friend rather than letting it pull you down.",
    "Be gentle with yourself and take one constructive step."
  ],

  angry: [
    "2.63",
    "Uncontrolled anger can cloud judgement.",
    "Pause before reacting. Create space between emotion and action."
  ],

  stress: [
    "2.48",
    "Balance helps you act without being shaken by success or failure.",
    "Control the process you can control; release the rest."
  ],

  fear: [
    "18.66",
    "When fear becomes heavy, reconnect with your deepest values.",
    "Choose the right next step instead of feeding the fear."
  ],

  peace: [
    "12.13",
    "Compassion, humility and steadiness are marks of inner strength.",
    "Protect your peace through kind and disciplined action."
  ]
};


document
  .querySelectorAll(
    "[data-feeling]"
  )
  .forEach(
    (button) => {

      button.onclick =
        () => {

          const result =
            feelings[
              button.dataset.feeling
            ];


          const box =
            document.getElementById(
              "wisdomResult"
            );


          if (!box || !result) {
            return;
          }


          box.classList.remove(
            "hidden"
          );


          box.innerHTML = `

            <div
              class="text-xs uppercase tracking-widest text-saffronDeep font-bold"
            >
              Recommended verse • ${result[0]}
            </div>

            <p
              class="font-display text-xl text-maroon mt-2"
            >
              ${result[1]}
            </p>

            <p
              class="mt-2 text-sm text-ink/70"
            >
              ${result[2]}
            </p>

            <button
              class="tool-btn mt-4"
              id="wisdomRead"
            >
              Open verse ${result[0]} →
            </button>

          `;


          const readButton =
            document.getElementById(
              "wisdomRead"
            );


          if (readButton) {

            readButton.onclick =
              () =>
                jumpToVerse(
                  result[0]
                );
          }
        };
    }
  );


/* =========================================================
   JUMP TO VERSE FUNCTION
   ========================================================= */

function jumpToVerse(
  reference
) {

  const match =
    String(reference)
      .match(
        /^(\d+)\.(\d+)$/
      );


  if (!match) {
    return;
  }


  const chapter =
    Number(match[1]);

  const verse =
    Number(match[2]);


  const library =
    document.getElementById(
      "library"
    );


  if (library) {

    library.scrollIntoView({
      behavior: "smooth"
    });
  }


  setTimeout(
    () => {

      selectChapter(
        chapter
      );

      setTimeout(
        () =>
          loadVerse(
            chapter,
            verse
          ),
        200
      );

    },
    300
  );
}


window.jumpToVerse =
  jumpToVerse;


/* =========================================================
   DAILY READ BUTTON
   ========================================================= */

const dailyReadButton =
  document.getElementById(
    "dailyReadBtn"
  );


if (dailyReadButton) {

  dailyReadButton.onclick =
    () =>
      jumpToVerse(
        todayWisdom[0]
      );
}


/* =========================================================
   CHAPTER JOURNEY
   ========================================================= */

function renderJourney() {

  const box =
    document.getElementById(
      "chapterJourney"
    );


  if (!box) {
    return;
  }


  box.innerHTML = "";


  for (
    let chapter = 1;
    chapter <= 18;
    chapter++
  ) {

    const completed =
      prefs.chapters.includes(
        chapter
      );


    const button =
      document.createElement(
        "button"
      );


    button.className =
      "rounded-xl border p-3 text-center transition hover:-translate-y-1 " +
      (
        completed
          ? "border-maroon bg-maroon text-paper"
          : "border-saffron/25 bg-paper text-maroon"
      );


    button.innerHTML = `

      <div class="font-bold">

        ${
          completed
            ? "✓ "
            : ""
        }

        ${chapter}

      </div>

      <div
        class="text-[10px] opacity-70"
      >
        Chapter
      </div>

    `;


    button.onclick =
      () =>
        jumpToVerse(
          chapter + ".1"
        );


    box.appendChild(
      button
    );
  }
}


renderJourney();
