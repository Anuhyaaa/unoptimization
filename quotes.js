const quotes = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
  },
  {
    text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: "Khloe Kardashian",
  },
  {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt",
  },
  {
    text: "Your body can stand almost anything. It's your mind that you have to convince.",
    author: "Unknown",
  },
  {
    text: "Success isn't always about greatness. It's about consistency.",
    author: "Dwayne Johnson",
  },
  { text: "The only way to finish is to start.", author: "Unknown" },
  { text: "Don't wish for a good body, work for it.", author: "Unknown" },
  { text: "Sweat is fat crying.", author: "Unknown" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  {
    text: "A one hour workout is 4% of your day. No excuses.",
    author: "Unknown",
  },
  {
    text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
    author: "Unknown",
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
  },
  {
    text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
    author: "Christian D. Larson",
  },
  {
    text: "Fitness is not a destination, it is a way of life.",
    author: "Unknown",
  },
];
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const quoteContainer = document.querySelector(".quote-container");
let quoteSwapTimer = null;
function getDailyQuote() {
  const today = new Date().toDateString();
  const savedQuoteDate = localStorage.getItem("fitTrackQuoteDate");
  const savedQuoteIndex = localStorage.getItem("fitTrackQuoteIndex");
  if (savedQuoteDate !== today || !savedQuoteIndex) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    localStorage.setItem("fitTrackQuoteDate", today);
    localStorage.setItem("fitTrackQuoteIndex", randomIndex.toString());
    return quotes[randomIndex];
  }
  return quotes[parseInt(savedQuoteIndex, 10)];
}
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
function displayQuote(quote) {
  if (quoteText) {
    quoteText.textContent = `"${quote.text}"`;
  }
  if (quoteAuthor) {
    quoteAuthor.textContent = `— ${quote.author}`;
  }
}

// Crossfades the quote content so changes feel deliberate but lightweight.
function swapQuote(quote) {
  if (!quoteText || !quoteAuthor) {
    return;
  }
  if (prefersReducedMotion || !quoteContainer) {
    displayQuote(quote);
    return;
  }
  if (quoteSwapTimer !== null) {
    window.clearTimeout(quoteSwapTimer);
  }
  quoteContainer.classList.add("is-changing");
  quoteSwapTimer = window.setTimeout(() => {
    displayQuote(quote);
    quoteContainer.classList.remove("is-changing");
  }, 180);
}
function init() {
  const dailyQuote = getDailyQuote();
  displayQuote(dailyQuote);
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", () => {
      const randomQuote = getRandomQuote();
      swapQuote(randomQuote);
    });
  }
}
init();
