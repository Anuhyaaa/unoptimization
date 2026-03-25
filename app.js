(function () {
  'use strict';

  const ROUTES = ['home', 'steps', 'weekly', 'water', 'quotes', 'nutrition', 'profile', 'progress', 'distance', 'settings', 'about'];
  const NAV_ITEMS = [
    ['home', 'Home'],
    ['steps', 'Steps'],
    ['weekly', 'Weekly'],
    ['water', 'Water'],
    ['quotes', 'Quotes'],
    ['nutrition', 'Nutrition'],
    ['profile', 'Profile'],
    ['progress', 'Progress'],
    ['distance', 'Distance'],
    ['settings', 'Settings'],
    ['about', 'About']
  ];

  const STORAGE_KEYS = {
    username: 'fittrack_username',
    legacyUsername: 'fittrackUserName',
    theme: 'fitTrackTheme',
    notifications: 'fitTrackNotifications',
    sound: 'fitTrackSound',
    steps: 'fitTrackSteps',
    stepsDistance: 'fitTrackDistance',
    stepsDate: 'fitTrackDate',
    weekly: 'fitTrackWeekly',
    water: 'fitTrackWater',
    waterDate: 'fitTrackWaterDate',
    quoteDate: 'fitTrackQuoteDate',
    quoteIndex: 'fitTrackQuoteIndex',
    weight: 'fitTrackWeight'
  };

  const STEP_GOAL = 10000;
  const STEP_LENGTH_KM = 0.00075;
  const CALORIES_PER_STEP = 0.04;
  const WATER_GOAL = 8;
  const STEP_UPPER_THRESHOLD = 11.6;
  const STEP_LOWER_THRESHOLD = 10.2;
  const STEP_COOLDOWN = 350;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const quotes = [
    { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
    { text: 'Take care of your body. It is the only place you have to live.', author: 'Jim Rohn' },
    { text: 'Fitness is not about being better than someone else. It is about being better than you used to be.', author: 'Khloe Kardashian' },
    { text: 'The groundwork for all happiness is good health.', author: 'Leigh Hunt' },
    { text: 'Your body can stand almost anything. It is your mind that you have to convince.', author: 'Unknown' },
    { text: 'Success is not always about greatness. It is about consistency.', author: 'Dwayne Johnson' },
    { text: 'The only way to finish is to start.', author: 'Unknown' },
    { text: 'Do not wish for a good body, work for it.', author: 'Unknown' },
    { text: 'Sweat is fat crying.', author: 'Unknown' },
    { text: 'You do not have to be extreme, just consistent.', author: 'Unknown' },
    { text: 'A one hour workout is 4% of your day. No excuses.', author: 'Unknown' },
    { text: 'Exercise is a celebration of what your body can do, not a punishment for what you ate.', author: 'Unknown' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Unknown' },
    { text: 'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.', author: 'Christian D. Larson' },
    { text: 'Fitness is not a destination, it is a way of life.', author: 'Unknown' }
  ];

  const foods = [
    {
      name: 'Oats',
      imageWebp: 'images/oats.webp',
      imageJpg: 'images/oats.jpg',
      alt: 'Bowl of nutritious oats',
      benefit: 'Provides long-lasting energy.'
    },
    {
      name: 'Eggs',
      imageWebp: 'images/eggs.webp',
      imageJpg: 'images/eggs.jpg',
      alt: 'Fresh eggs for protein',
      benefit: 'High-quality protein for muscle building.'
    },
    {
      name: 'Banana',
      imageWebp: 'images/banana.webp',
      imageJpg: 'images/banana.jpg',
      alt: 'Yellow bananas rich in potassium',
      benefit: 'Quick energy and potassium source.'
    },
    {
      name: 'Chicken Breast',
      imageWebp: 'images/chicken.webp',
      imageJpg: 'images/chicken.jpg',
      alt: 'Grilled chicken breast',
      benefit: 'Lean protein for muscle recovery.'
    },
    {
      name: 'Brown Rice',
      imageWebp: 'images/brown-rice.webp',
      imageJpg: 'images/brown-rice.jpg',
      alt: 'Bowl of brown rice',
      benefit: 'Healthy carbs for sustained energy.'
    },
    {
      name: 'Almonds',
      imageWebp: 'images/almonds.webp',
      imageJpg: 'images/almonds.jpg',
      alt: 'Almonds with healthy fats',
      benefit: 'Healthy fats and vitamins.'
    },
    {
      name: 'Greek Yogurt',
      imageWebp: 'images/greek-yogurt.webp',
      imageJpg: 'images/greek-yogurt.jpg',
      alt: 'Greek yogurt in a bowl',
      benefit: 'High protein and gut-friendly.'
    },
    {
      name: 'Spinach',
      imageWebp: 'images/spinach.webp',
      imageJpg: 'images/spinach.jpg',
      alt: 'Fresh green spinach leaves',
      benefit: 'Rich in iron and antioxidants.'
    },
    {
      name: 'Salmon',
      imageWebp: 'images/salmon.webp',
      imageJpg: 'images/salmon.jpg',
      alt: 'Fresh salmon fillet',
      benefit: 'Omega-3 for heart health.'
    },
    {
      name: 'Avocado',
      imageWebp: 'images/avocado.webp',
      imageJpg: 'images/avocado.jpg',
      alt: 'Sliced avocado',
      benefit: 'Healthy fats for overall wellness.'
    }
  ];

  const Storage = {
    get(key, fallback = '') {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        console.warn('localStorage read failed:', error);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage write failed:', error);
        return false;
      }
    },
    getJSON(key, fallback = {}) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        console.warn('localStorage JSON read failed:', error);
        return fallback;
      }
    },
    setJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('localStorage JSON write failed:', error);
        return false;
      }
    }
  };

  const State = {
    get username() {
      return Storage.get(STORAGE_KEYS.username, Storage.get(STORAGE_KEYS.legacyUsername, ''));
    },
    set username(value) {
      Storage.set(STORAGE_KEYS.username, String(value));
    },
    get theme() {
      return Storage.get(STORAGE_KEYS.theme, 'light');
    },
    set theme(value) {
      Storage.set(STORAGE_KEYS.theme, value === 'dark' ? 'dark' : 'light');
    },
    get notifications() {
      return Storage.get(STORAGE_KEYS.notifications, 'on');
    },
    set notifications(value) {
      Storage.set(STORAGE_KEYS.notifications, value === 'off' ? 'off' : 'on');
    },
    get sound() {
      return Storage.get(STORAGE_KEYS.sound, 'on');
    },
    set sound(value) {
      Storage.set(STORAGE_KEYS.sound, value === 'off' ? 'off' : 'on');
    },
    get steps() {
      return Number.parseInt(Storage.get(STORAGE_KEYS.steps, '0'), 10) || 0;
    },
    set steps(value) {
      Storage.set(STORAGE_KEYS.steps, String(Math.max(0, Number(value) || 0)));
    },
    get stepDistance() {
      return Number.parseFloat(Storage.get(STORAGE_KEYS.stepsDistance, '0')) || 0;
    },
    set stepDistance(value) {
      Storage.set(STORAGE_KEYS.stepsDistance, Number(value).toFixed(2));
    },
    get stepDate() {
      return Storage.get(STORAGE_KEYS.stepsDate, '');
    },
    set stepDate(value) {
      Storage.set(STORAGE_KEYS.stepsDate, String(value));
    },
    get weekly() {
      return Storage.getJSON(STORAGE_KEYS.weekly, {});
    },
    set weekly(value) {
      Storage.setJSON(STORAGE_KEYS.weekly, value || {});
    },
    get water() {
      return Number.parseInt(Storage.get(STORAGE_KEYS.water, '0'), 10) || 0;
    },
    set water(value) {
      Storage.set(STORAGE_KEYS.water, String(Math.max(0, Number(value) || 0)));
    },
    get waterDate() {
      return Storage.get(STORAGE_KEYS.waterDate, '');
    },
    set waterDate(value) {
      Storage.set(STORAGE_KEYS.waterDate, String(value));
    },
    get weight() {
      return Storage.get(STORAGE_KEYS.weight, '');
    },
    set weight(value) {
      Storage.set(STORAGE_KEYS.weight, String(value));
    },
    get quoteDate() {
      return Storage.get(STORAGE_KEYS.quoteDate, '');
    },
    set quoteDate(value) {
      Storage.set(STORAGE_KEYS.quoteDate, String(value));
    },
    get quoteIndex() {
      return Number.parseInt(Storage.get(STORAGE_KEYS.quoteIndex, '0'), 10) || 0;
    },
    set quoteIndex(value) {
      Storage.set(STORAGE_KEYS.quoteIndex, String(Math.max(0, Number(value) || 0)));
    }
  };

  State.update = function update(partialState = {}) {
    Object.entries(partialState).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(State, key)) {
        State[key] = value;
      }
    });

    return State;
  };

  function scheduleFrame(callback) {
    return window.requestAnimationFrame(() => {
      callback();
    });
  }

  function todayKey(date = new Date()) {
    return date.toDateString();
  }

  function currentDateLabel() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
  }

  function escapeAttribute(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function ensureDailyStepReset() {
    const today = todayKey();
    const savedDate = State.stepDate;
    if (savedDate !== today) {
      if (savedDate && State.steps > 0) {
        updateWeeklyRecord(savedDate, State.steps);
      }
      State.steps = 0;
      State.stepDistance = 0;
      State.stepDate = today;
    }
  }

  function ensureDailyWaterReset() {
    const today = todayKey();
    if (State.waterDate !== today) {
      State.water = 0;
      State.waterDate = today;
    }
  }

  function updateWeeklyRecord(dateString, steps) {
    const weeklyData = State.weekly;
    weeklyData[dateString] = Number(steps) || 0;

    const dates = Object.keys(weeklyData).sort((left, right) => new Date(right) - new Date(left));
    if (dates.length > 30) {
      dates.slice(30).forEach((date) => {
        delete weeklyData[date];
      });
    }

    State.weekly = weeklyData;
  }

  function getWeeklyData() {
    return State.weekly;
  }

  function getStepsForDate(date, weeklyData = getWeeklyData()) {
    return weeklyData[date.toDateString()] || 0;
  }

  function getStreak() {
    const weeklyData = getWeeklyData();
    let streak = 0;
    const cursor = new Date();

    while (streak <= 365) {
      const steps = weeklyData[cursor.toDateString()] || 0;
      if (steps < 1000) {
        break;
      }

      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  function getDashboardSummary() {
    ensureDailyStepReset();
    ensureDailyWaterReset();

    return {
      steps: State.steps,
      water: State.water,
      streak: getStreak()
    };
  }

  function getDailyQuote() {
    const today = todayKey();
    if (State.quoteDate !== today || State.quoteIndex >= quotes.length) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      State.quoteDate = today;
      State.quoteIndex = randomIndex;
    }

    return quotes[State.quoteIndex] || quotes[0];
  }

  function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    State.quoteIndex = randomIndex;
    State.quoteDate = todayKey();
    return quotes[randomIndex];
  }

  function navMarkup(activeRoute) {
    const links = NAV_ITEMS.map(([route, label]) => {
      const active = route === activeRoute ? ' active' : '';
      const current = route === activeRoute ? ' aria-current=\'page\'' : '';
      return `<li><a href='#${route}' class='nav-link${active}' data-nav='${route}'${current}>${label}</a></li>`;
    }).join('');

    return `
      <nav class='navbar'>
        <div class='nav-container'>
          <a href='#home' class='nav-brand' data-nav='home'>FitTrack</a>
          <ul class='nav-links'>${links}</ul>
        </div>
      </nav>
    `;
  }

  function footerMarkup() {
    return `
      <footer class='footer'>
        <p>&copy; 2026 FitTrack. All rights reserved.</p>
      </footer>
    `;
  }

  function shellMarkup(activeRoute, title, subtitle, content) {
    return `
      <div class='app-shell'>
        ${navMarkup(activeRoute)}
        <div class='route-view'>
          <div class='page-header'>
            <h1 class='page-title'>${title}</h1>
            <p class='page-subtitle'>${subtitle}</p>
          </div>
          ${content}
        </div>
        ${footerMarkup()}
      </div>
    `;
  }

  function homeContent() {
    const summary = getDashboardSummary();
    const username = State.username;
    const welcome = username ? `Welcome back, ${username} 👋` : 'Welcome to FitTrack 👋';
    const quickLinks = [
      ['steps', '📱', 'Step Counter', 'Track your steps in real-time'],
      ['weekly', '📊', 'Weekly Summary', 'View your weekly progress'],
      ['water', '🚰', 'Water Tracker', 'Stay hydrated daily'],
      ['quotes', '💪', 'Daily Motivation', 'Get inspired every day'],
      ['distance', '📍', 'Distance Tracker', 'Track your walking distance'],
      ['progress', '📈', 'Progress Overview', 'See your achievements']
    ]
      .map(([route, icon, cardTitle, label]) => `
        <a href='#${route}' class='dashboard-card' data-nav='${route}'>
          <div class='dashboard-card-icon'>${icon}</div>
          <h3 class='dashboard-card-title'>${cardTitle}</h3>
          <p class='dashboard-card-label'>${label}</p>
        </a>
      `)
      .join('');

    return `
      <main class='container dashboard'>
        <div class='dashboard-grid'>
          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>👟</div>
            <h3 class='dashboard-card-title'>Today's Steps</h3>
            <div class='dashboard-card-value' id='todaySteps'>${formatNumber(summary.steps)}</div>
            <p class='dashboard-card-label'>Goal: ${formatNumber(STEP_GOAL)} steps</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>💧</div>
            <h3 class='dashboard-card-title'>Water Intake</h3>
            <div class='dashboard-card-value' id='waterIntake'>${formatNumber(summary.water)}</div>
            <p class='dashboard-card-label'>Goal: ${WATER_GOAL} glasses</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>🔥</div>
            <h3 class='dashboard-card-title'>Current Streak</h3>
            <div class='dashboard-card-value' id='currentStreak'>${formatNumber(summary.streak)}</div>
            <p class='dashboard-card-label'>Days in a row</p>
          </div>
        </div>

        <h2 class='section-title'>Quick Access</h2>
        <div class='dashboard-grid'>${quickLinks}</div>
      </main>
    `;
  }

  function stepsContent() {
    return `
      <main class='container'>
        <div class='card step-counter-card'>
          <div class='progress-container'>
            <svg class='progress-ring' viewBox='0 0 200 200' width='280' height='280'>
              <g transform='rotate(-90 100 100)'>
                <circle class='progress-ring-circle-bg' stroke='#e5d8c8' stroke-width='14' fill='transparent' r='86' cx='100' cy='100'></circle>
                <circle class='progress-ring-circle' stroke='#c49a6c' stroke-width='14' fill='transparent' r='86' cx='100' cy='100' id='progressRingCircle'></circle>
              </g>
            </svg>
            <div class='step-count-text'>
              <div class='step-number' id='stepNumber'>0</div>
              <div class='step-label'>Steps</div>
            </div>
          </div>

          <div class='daily-goal-text'>Daily Goal: ${formatNumber(STEP_GOAL)} steps</div>

          <div class='calories-container'>
            <div class='calories-icon'>🔥</div>
            <div class='calories-text'><span id='caloriesBurned'>0</span> kcal burned</div>
          </div>

          <div class='calories-container'>
            <div class='calories-icon'>📍</div>
            <div class='calories-text'>Distance: <span id='distanceKm'>0.00</span> km</div>
          </div>

          <button class='btn' id='startStopBtn'>Start Tracking</button>
          <button class='btn btn-full btn-secondary' id='resetBtn'>Reset Steps</button>

          <div class='status-message' id='statusMessage'>Loading step tracker...</div>
        </div>
      </main>
    `;
  }

  function weeklyContent() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return `
      <main class='container'>
        <div class='card weekly-card'>
          <h2 class='weekly-title'>This Week</h2>
          <div class='weekly-list' id='weeklyList'>
            ${days
              .map((day) => {
                const shortLabel = day.slice(0, 3);
                return `
                  <div class='weekly-item' data-day='${day}'>
                    <span class='day-name'>${shortLabel}</span>
                    <span class='day-steps'>0 steps</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </main>
    `;
  }

  function waterContent() {
    return `
      <main class='container'>
        <div class='card surface stack center'>
          <div class='dashboard-card-icon' style='font-size: 4rem; margin-bottom: 1rem;'>💧</div>
          <h2 class='center' style='font-size: 2.5rem; color: var(--accent-color); margin-bottom: 1rem;'>
            <span id='waterCount'>0</span> / ${WATER_GOAL}
          </h2>
          <p class='center field-note' style='margin-bottom: 2rem;'>Glasses</p>

          <div class='progress-bar-container'>
            <div class='progress-bar-fill' id='waterProgress' style='width: 0%;'>
              <span id='waterPercentage'>0%</span>
            </div>
          </div>

          <div id='waterGlasses' class='inline-actions' style='justify-content: center; margin: 2rem 0;'></div>

          <button class='btn btn-full' id='addGlassBtn' style='margin-bottom: 1rem;'>+ Add Glass</button>
          <button class='btn btn-full btn-secondary' id='resetWaterBtn'>Reset</button>

          <div class='status-message' id='statusMessage-water'>Start tracking your water intake!</div>
        </div>
      </main>
    `;
  }

  function quotesContent() {
    return `
      <main class='container'>
        <div class='card quote-card'>
          <div class='quote-container surface stack center'>
            <div class='quote-icon'>💪</div>
            <blockquote class='quote-text' id='quoteText'>Loading your daily inspiration...</blockquote>
            <p class='quote-author' id='quoteAuthor'>— Anonymous</p>
          </div>
          <button class='btn btn-full' id='newQuoteBtn'>Get New Quote</button>
          <div class='status-message' style='margin-top: 1.5rem;'>A new quote is automatically shown each day.</div>
        </div>
      </main>
    `;
  }

  function nutritionContent() {
    return `
      <main class='container'>
        <div class='card'>
          <p class='nutrition-intro center'>
            A balanced diet is essential for maintaining good health and fitness. Here are some recommended healthy foods to include in your daily meals.
          </p>
          <div class='nutrition-grid food-grid' id='foodGrid'></div>
        </div>
      </main>
    `;
  }

  function profileContent() {
    const username = State.username || 'User';
    const safeName = escapeAttribute(username);
    return `
      <main class='container'>
        <div class='card profile-container surface stack center'>
          <img src='https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}' alt='Profile Avatar' class='profile-avatar' id='profileAvatar' width='120' height='120' loading='lazy' decoding='async'>
          <h2 class='profile-name' id='profileName'>${safeName}</h2>
          <p class='profile-role'>Fitness Enthusiast</p>
          <button class='change-name-btn' id='changeNameBtn' type='button'>✏️ Change Name</button>

          <div class='form-group'>
            <label for='weightInput' class='form-label'>Weight (kg)</label>
            <input type='number' id='weightInput' class='form-input' placeholder='Enter your weight' min='1' max='500'>
          </div>

          <div id='weightDisplay' class='field-note center'></div>

          <button class='btn btn-full' id='saveWeightBtn'>Save Weight</button>

          <div class='status-message' id='statusMessage-profile' style='margin-top: 1.5rem; display: none;'>Profile updated successfully!</div>
        </div>
      </main>
    `;
  }

  function progressContent() {
    return `
      <main class='container dashboard'>
        <div class='dashboard-grid'>
          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>👟</div>
            <h3 class='dashboard-card-title'>Today's Steps</h3>
            <div class='dashboard-card-value' id='todaySteps'>0</div>
            <p class='dashboard-card-label'>Goal: ${formatNumber(STEP_GOAL)} steps</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>📊</div>
            <h3 class='dashboard-card-title'>Weekly Total</h3>
            <div class='dashboard-card-value' id='weeklyTotal'>0</div>
            <p class='dashboard-card-label'>Steps this week</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>🔥</div>
            <h3 class='dashboard-card-title'>Calories Burned</h3>
            <div class='dashboard-card-value' id='caloriesBurned'>0</div>
            <p class='dashboard-card-label'>Today's calories</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>💧</div>
            <h3 class='dashboard-card-title'>Water Intake</h3>
            <div class='dashboard-card-value' id='waterIntake'>0</div>
            <p class='dashboard-card-label'>Glasses today</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>🎯</div>
            <h3 class='dashboard-card-title'>Goal Achievement</h3>
            <div class='dashboard-card-value' id='goalPercent'>0%</div>
            <p class='dashboard-card-label'>Daily progress</p>
          </div>

          <div class='dashboard-card'>
            <div class='dashboard-card-icon'>📅</div>
            <h3 class='dashboard-card-title'>Active Days</h3>
            <div class='dashboard-card-value' id='activeDays'>0</div>
            <p class='dashboard-card-label'>This week</p>
          </div>
        </div>
      </main>
    `;
  }

  function distanceContent() {
    return `
      <main class='container'>
        <div class='card'>
          <div class='dashboard-card-icon' style='font-size: 4rem; margin-bottom: 1rem;'>📍</div>
          <h2 class='center' style='font-size: 3rem; color: var(--accent-color); margin-bottom: 0.5rem;'>
            <span id='distanceDisplay'>0.00 km</span>
          </h2>
          <p class='center field-note' style='margin-bottom: 2rem;'>Today's Distance</p>

          <div class='stats-container'>
            <div class='stat-item'>
              <span class='stat-icon'>👟</span>
              <span class='stat-value' id='distanceSteps'>0</span>
              <span class='stat-label'>Steps</span>
            </div>
            <div class='stat-item'>
              <span class='stat-icon'>🔥</span>
              <span class='stat-value' id='distanceCalories'>0</span>
              <span class='stat-label'>Calories</span>
            </div>
          </div>

          <div class='stack surface' style='padding: 1.25rem; margin: 1.5rem 0;'>
            <div class='inline-actions' style='justify-content: space-between;'>
              <span class='field-note'>Duration:</span>
              <strong id='duration'>00:00:00</strong>
            </div>
            <div class='inline-actions' style='justify-content: space-between;'>
              <span class='field-note'>Avg Speed:</span>
              <strong id='avgSpeed'>0.0 km/h</strong>
            </div>
            <div class='inline-actions' style='justify-content: space-between;'>
              <span class='field-note'>Status:</span>
              <strong id='trackingStatus'>Not Started</strong>
            </div>
          </div>

          <button class='btn btn-full' id='startBtn' style='margin-bottom: 1rem;'>Start Walk</button>
          <button class='btn btn-full btn-secondary' id='stopBtn' style='display: none;'>Stop Walk</button>

          <div class='status-message' id='statusMessage-distance'>Click \"Start Walk\" to begin tracking</div>
        </div>
      </main>
    `;
  }

  function settingsContent() {
    return `
      <main class='container'>
        <div class='card stack'>
          <h2 class='section-title' style='margin-top: 0;'>⚙️ App Settings</h2>

          <div class='toggle-container'>
            <div>
              <div class='toggle-label'>Dark Mode</div>
              <p class='field-note' style='margin-top: 0.3rem;'>Switch between light and dark themes</p>
              <p id='themeStatus' style='font-size: 0.9rem; font-weight: 600; margin-top: 0.5rem; color: var(--accent-color);'>Theme: Light Mode</p>
            </div>
            <div class='toggle-switch' id='themeToggle' role='switch' aria-checked='false' tabindex='0'>
              <div class='toggle-slider'></div>
            </div>
          </div>

          <div class='toggle-container'>
            <div>
              <div class='toggle-label'>Notifications</div>
              <p class='field-note' style='margin-top: 0.3rem;'>Get reminders for water and steps</p>
              <p id='notificationStatus' style='font-size: 0.9rem; font-weight: 600; margin-top: 0.5rem; color: var(--accent-color);'>Notifications: On</p>
            </div>
            <div class='toggle-switch' id='notificationToggle' role='switch' aria-checked='true' tabindex='0'>
              <div class='toggle-slider'></div>
            </div>
          </div>

          <div class='toggle-container'>
            <div>
              <div class='toggle-label'>Sound Effects</div>
              <p class='field-note' style='margin-top: 0.3rem;'>Play sounds for achievements</p>
              <p id='soundStatus' style='font-size: 0.9rem; font-weight: 600; margin-top: 0.5rem; color: var(--accent-color);'>Sound Effects: On</p>
            </div>
            <div class='toggle-switch' id='soundToggle' role='switch' aria-checked='true' tabindex='0'>
              <div class='toggle-slider'></div>
            </div>
          </div>

          <div class='status-message'>Settings are automatically saved</div>
        </div>
      </main>
    `;
  }

  function aboutContent() {
    return `
      <main class='container about-page'>
        <article class='about-card surface'>
          <img src='images/about-fitness.webp' alt='Fitness tracking illustration' class='about-image' loading='lazy'>

          <section class='about-section'>
            <p class='about-kicker'>About FitTrack</p>
            <h2 class='about-heading'>Built to feel simple, not demanding</h2>
            <p class='about-copy'>
              FitTrack keeps the daily habits that matter visible without turning the app into a chore. It started with step tracking and grew into a small place for the health metrics that are easiest to ignore when life gets busy.
            </p>
          </section>

          <section class='about-section'>
            <h3 class='about-heading about-heading-sm'>Why this version is simpler</h3>
            <p class='about-copy'>
              The app now renders from a single entry point, shares its navigation and page chrome, and keeps the state in one place so the implementation is easier to maintain.
            </p>
          </section>

          <section class='about-section'>
            <h3 class='about-heading about-heading-sm'>How to use it</h3>
            <ul class='about-list'>
              <li>Open FitTrack on your phone</li>
              <li>Allow motion permissions when asked</li>
              <li>Start walking and let it do the rest</li>
            </ul>
          </section>
        </article>
      </main>
    `;
  }

  function mountHome(root) {
    const welcomeMessage = root.querySelector('#welcomeMessage');
    const currentDate = root.querySelector('#currentDate');
    const todaySteps = root.querySelector('#todaySteps');
    const waterIntake = root.querySelector('#waterIntake');
    const currentStreak = root.querySelector('#currentStreak');

    function updateDashboard() {
      const summary = getDashboardSummary();
      const username = State.username;

      if (welcomeMessage) {
        welcomeMessage.textContent = username ? `Welcome back, ${username} 👋` : 'Welcome to FitTrack 👋';
      }

      if (currentDate) {
        currentDate.textContent = currentDateLabel();
      }

      if (todaySteps) {
        todaySteps.textContent = formatNumber(summary.steps);
      }

      if (waterIntake) {
        waterIntake.textContent = formatNumber(summary.water);
      }

      if (currentStreak) {
        currentStreak.textContent = formatNumber(summary.streak);
      }
    }

    updateDashboard();
    window.updateDashboard = updateDashboard;

    return () => {
      if (window.updateDashboard === updateDashboard) {
        delete window.updateDashboard;
      }
    };
  }

  function mountSteps(root) {
    const stepNumber = root.querySelector('#stepNumber');
    const caloriesBurned = root.querySelector('#caloriesBurned');
    const distanceKm = root.querySelector('#distanceKm');
    const resetBtn = root.querySelector('#resetBtn');
    const startStopBtn = root.querySelector('#startStopBtn');
    const statusMessage = root.querySelector('#statusMessage');
    const progressCircle = root.querySelector('#progressRingCircle');
    const stepCounterCard = root.querySelector('.step-counter-card');

    let stepCount = 0;
    let displayedStepCount = 0;
    let distanceValue = 0;
    let lastStepTime = 0;
    let stepArmed = false;
    let isTracking = false;
    let motionAttached = false;
    let stepAnimationFrame = null;

    function setStatus(message) {
      if (statusMessage) {
        statusMessage.textContent = message;
      }
    }

    function syncFromStorage() {
      ensureDailyStepReset();
      stepCount = State.steps;
      distanceValue = State.stepDistance || stepCount * STEP_LENGTH_KM;
    }

    function persistSteps() {
      const today = todayKey();
      State.steps = stepCount;
      State.stepDistance = distanceValue;
      State.stepDate = today;
      updateWeeklyRecord(today, stepCount);
    }

    function renderStepCount(targetValue, animateCount = true) {
      if (!stepNumber) {
        return;
      }

      if (stepAnimationFrame !== null) {
        cancelAnimationFrame(stepAnimationFrame);
        stepAnimationFrame = null;
      }

      if (!animateCount || prefersReducedMotion || displayedStepCount === targetValue) {
        displayedStepCount = targetValue;
        stepNumber.textContent = formatNumber(targetValue);
        return;
      }

      const startValue = displayedStepCount;
      const duration = 360;
      const delta = targetValue - startValue;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + delta * eased);
        displayedStepCount = currentValue;
        stepNumber.textContent = formatNumber(currentValue);

        if (progress < 1) {
          stepAnimationFrame = requestAnimationFrame(tick);
          return;
        }

        displayedStepCount = targetValue;
        stepNumber.textContent = formatNumber(targetValue);
        stepAnimationFrame = null;
      };

      stepAnimationFrame = requestAnimationFrame(tick);
    }

    function updateDisplay(options = {}) {
      renderStepCount(stepCount, options.animateCount !== false);

      if (caloriesBurned) {
        caloriesBurned.textContent = formatNumber(Math.round(stepCount * CALORIES_PER_STEP));
      }

      if (distanceKm) {
        distanceKm.textContent = distanceValue.toFixed(2);
      }

      if (progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(stepCount / STEP_GOAL, 1);
        const offset = circumference - progress * circumference;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = offset;
      }

      if (stepCounterCard) {
        stepCounterCard.classList.toggle('goal-achieved', stepCount >= STEP_GOAL);
      }
    }

    function updateButtonLabel() {
      if (!startStopBtn) {
        return;
      }

      startStopBtn.textContent = isTracking ? 'Stop Tracking' : 'Start Tracking';
    }

    function startTracking() {
      if (isTracking) {
        return;
      }

      if (typeof DeviceMotionEvent === 'undefined') {
        setStatus('Device motion is not supported on this device.');
        return;
      }

      if (!motionAttached) {
        window.addEventListener('devicemotion', handleMotion, { passive: true });
        motionAttached = true;
      }

      isTracking = true;
      stepArmed = false;
      lastStepTime = 0;
      updateButtonLabel();
      setStatus('Tracking active');
    }

    function stopTracking(message = 'Tracking stopped') {
      isTracking = false;
      stepArmed = false;
      updateButtonLabel();
      setStatus(message);
    }

    function requestMotionPermission() {
      if (typeof DeviceMotionEvent === 'undefined') {
        setStatus('Device motion is not supported on this device.');
        return;
      }

      if (typeof DeviceMotionEvent.requestPermission !== 'function') {
        startTracking();
        return;
      }

      DeviceMotionEvent.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            startTracking();
            return;
          }

          setStatus('Permission denied');
        })
        .catch((error) => {
          console.error('Permission request error:', error);
          setStatus('Permission denied');
        });
    }

    function handleStepDetected(magnitude) {
      stepCount += 1;
      distanceValue = stepCount * STEP_LENGTH_KM;
      lastStepTime = Date.now();
      stepArmed = false;
      persistSteps();
      updateDisplay({ animateCount: true });

      if (stepCount === STEP_GOAL) {
        setStatus('🎉 Daily goal achieved!');
      }

      console.log('Step detected:', {
        stepCount,
        distanceKm: Number(distanceValue.toFixed(3)),
        magnitude: Number(magnitude.toFixed(2))
      });
    }

    function handleMotion(event) {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) {
        return;
      }

      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const currentTime = Date.now();
      const timeSinceLastStep = currentTime - lastStepTime;

      if (!stepArmed && magnitude >= STEP_UPPER_THRESHOLD) {
        stepArmed = true;
      }

      if (stepArmed && magnitude <= STEP_LOWER_THRESHOLD && timeSinceLastStep >= STEP_COOLDOWN) {
        handleStepDetected(magnitude);
      }

      if (magnitude <= STEP_LOWER_THRESHOLD) {
        stepArmed = false;
      }
    }

    function resetSteps() {
      if (!window.confirm('Are you sure you want to reset your step count?')) {
        return;
      }

      stepCount = 0;
      distanceValue = 0;
      stepArmed = false;
      lastStepTime = 0;
      persistSteps();
      updateDisplay({ animateCount: true });
      stopTracking('Ready to track your steps!');
    }

    syncFromStorage();
    updateDisplay({ animateCount: !prefersReducedMotion });
    updateButtonLabel();
    setStatus('Ready to track your steps!');

    if (resetBtn) {
      resetBtn.addEventListener('click', resetSteps);
    }

    if (startStopBtn) {
      startStopBtn.addEventListener('click', () => {
        if (isTracking) {
          stopTracking('Tracking stopped');
          return;
        }

        requestMotionPermission();
      });
    }

    window.updateStepDisplay = updateDisplay;

    return () => {
      if (motionAttached) {
        window.removeEventListener('devicemotion', handleMotion);
      }

      if (stepAnimationFrame !== null) {
        cancelAnimationFrame(stepAnimationFrame);
      }

      if (window.updateStepDisplay === updateDisplay) {
        delete window.updateStepDisplay;
      }
    };
  }

  function mountWeekly(root) {
    const weeklyList = root.querySelector('#weeklyList');

    function renderWeeklySummary() {
      const weeklyData = getWeeklyData();
      const today = new Date();
      const currentDay = today.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const startOfWeek = new Date(today);
      const daysSinceMonday = (currentDay + 6) % 7;
      startOfWeek.setDate(today.getDate() - daysSinceMonday);

      if (!weeklyList) {
        return;
      }

      weeklyList.querySelectorAll('.weekly-item').forEach((item, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const steps = getStepsForDate(date, weeklyData);
        const dayStepsElement = item.querySelector('.day-steps');
        const dayNameElement = item.querySelector('.day-name');
        const itemDay = item.getAttribute('data-day');
        const todayName = dayNames[currentDay];

        if (dayNameElement) {
          dayNameElement.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
        }

        if (dayStepsElement) {
          dayStepsElement.textContent = `${formatNumber(steps)} steps`;
        }

        item.classList.toggle('current-day', itemDay === todayName);
      });
    }

    renderWeeklySummary();
    window.loadWeeklyData = renderWeeklySummary;

    return () => {
      if (window.loadWeeklyData === renderWeeklySummary) {
        delete window.loadWeeklyData;
      }
    };
  }

  function mountWater(root) {
    const waterCount = root.querySelector('#waterCount');
    const waterProgress = root.querySelector('#waterProgress');
    const waterPercentage = root.querySelector('#waterPercentage');
    const waterGlasses = root.querySelector('#waterGlasses');
    const addGlassBtn = root.querySelector('#addGlassBtn');
    const resetWaterBtn = root.querySelector('#resetWaterBtn');
    const statusMessage = root.querySelector('#statusMessage-water');
    let currentCount = 0;
    let waterDisplayFrame = null;
    let waterGlassesFrame = null;

    function setStatus(message, tone = 'default') {
      if (!statusMessage) {
        return;
      }

      statusMessage.textContent = message;
      statusMessage.classList.remove('is-success', 'is-error', 'is-updated');
      statusMessage.classList.add(tone === 'success' ? 'is-success' : tone === 'error' ? 'is-error' : 'is-updated');
    }

    function loadWaterData() {
      ensureDailyWaterReset();
      currentCount = State.water;
    }

    function saveWaterData() {
      State.update({
        water: currentCount,
        waterDate: todayKey()
      });
    }

    function updateGoalState() {
      const goalReached = currentCount >= WATER_GOAL;
      if (waterProgress) {
        waterProgress.classList.toggle('goal-reached', goalReached);
      }

      if (waterGlasses) {
        waterGlasses.classList.toggle('goal-reached', goalReached);
      }
    }

    function updateDisplay() {
      if (waterDisplayFrame !== null) {
        cancelAnimationFrame(waterDisplayFrame);
      }

      waterDisplayFrame = scheduleFrame(() => {
        if (waterCount) {
          waterCount.textContent = String(currentCount);
        }

        const percentage = Math.min((currentCount / WATER_GOAL) * 100, 100);

        if (waterProgress) {
          waterProgress.style.width = `${percentage}%`;
        }

        if (waterPercentage) {
          waterPercentage.textContent = `${Math.round(percentage)}%`;
        }

        updateGoalState();
        waterDisplayFrame = null;
      });
    }

    function renderGlasses() {
      if (!waterGlasses) {
        return;
      }

      if (waterGlassesFrame !== null) {
        cancelAnimationFrame(waterGlassesFrame);
      }

      waterGlassesFrame = scheduleFrame(() => {
        waterGlasses.innerHTML = '';

        for (let index = 0; index < WATER_GOAL; index += 1) {
          const glass = document.createElement('div');
          glass.className = 'water-glass';
          glass.textContent = index < currentCount ? '💧' : '🥛';

          if (index < currentCount && !prefersReducedMotion) {
            glass.style.animationDelay = `${index * 35}ms`;
          }

          waterGlasses.appendChild(glass);
        }

        waterGlassesFrame = null;
      });
    }

    function addGlass() {
      if (currentCount >= WATER_GOAL) {
        setStatus('You have reached your daily water goal!', 'success');
        return;
      }

      currentCount += 1;
      saveWaterData();
      updateDisplay();
      renderGlasses();

      if (currentCount === WATER_GOAL) {
        setStatus('🎉 Daily water goal achieved!', 'success');
        return;
      }

      setStatus('Water added', 'updated');
    }

    function resetWater() {
      if (!window.confirm('Are you sure you want to reset your water intake?')) {
        return;
      }

      currentCount = 0;
      saveWaterData();
      updateDisplay();
      renderGlasses();
      setStatus('Water intake reset', 'updated');
    }

    loadWaterData();
    updateDisplay();
    renderGlasses();
    setStatus('Water tracker ready', 'updated');

    if (addGlassBtn) {
      addGlassBtn.addEventListener('click', addGlass);
    }

    if (resetWaterBtn) {
      resetWaterBtn.addEventListener('click', resetWater);
    }

    window.loadWaterData = loadWaterData;

    return () => {
      if (window.loadWaterData === loadWaterData) {
        delete window.loadWaterData;
      }
    };
  }

  function mountQuotes(root) {
    const quoteText = root.querySelector('#quoteText');
    const quoteAuthor = root.querySelector('#quoteAuthor');
    const newQuoteBtn = root.querySelector('#newQuoteBtn');
    const quoteContainer = root.querySelector('.quote-container');
    let quoteSwapFrame = null;
    let quoteAnimationCleanup = null;

    function displayQuote(quote) {
      if (quoteText) {
        quoteText.textContent = `"${quote.text}"`;
      }

      if (quoteAuthor) {
        quoteAuthor.textContent = `— ${quote.author}`;
      }
    }

    function swapQuote(quote) {
      if (prefersReducedMotion || !quoteContainer) {
        displayQuote(quote);
        return;
      }

      if (quoteSwapFrame !== null) {
        cancelAnimationFrame(quoteSwapFrame);
      }

      if (quoteAnimationCleanup) {
        quoteContainer.removeEventListener('animationend', quoteAnimationCleanup);
        quoteAnimationCleanup = null;
      }

      quoteContainer.classList.add('is-changing');
      quoteSwapFrame = scheduleFrame(() => {
        displayQuote(quote);
        quoteAnimationCleanup = (event) => {
          if (event.target === quoteContainer) {
            quoteContainer.classList.remove('is-changing');
            quoteAnimationCleanup = null;
          }
        };
        quoteContainer.addEventListener('animationend', quoteAnimationCleanup, { once: true });
      });
    }

    const dailyQuote = getDailyQuote();
    displayQuote(dailyQuote);

    if (newQuoteBtn) {
      newQuoteBtn.addEventListener('click', () => {
        swapQuote(getRandomQuote());
      });
    }

    window.displayQuote = displayQuote;

    return () => {
      if (quoteSwapFrame !== null) {
        cancelAnimationFrame(quoteSwapFrame);
      }

      if (window.displayQuote === displayQuote) {
        delete window.displayQuote;
      }
    };
  }

  function mountNutrition(root) {
    const foodGrid = root.querySelector('#foodGrid');
    if (foodGrid) {
      foodGrid.innerHTML = foods
        .map(
          (food) => `
            <article class='nutrition-card food-card'>
              <picture class='nutrition-media food-img'>
                <source type='image/webp' srcset='${food.imageWebp}'>
                <img src='${food.imageJpg}' srcset='${food.imageJpg}' sizes='(max-width: 599px) 100vw, (max-width: 1023px) 50vw, (max-width: 1439px) 33vw, 25vw' alt='${escapeAttribute(food.alt || food.name)}' loading='lazy' decoding='async'>
              </picture>
              <h3 class='nutrition-title food-name'>${food.name}</h3>
              <p class='nutrition-copy food-benefit'>${food.benefit}</p>
            </article>
          `
        )
        .join('');
    }

    return () => {};
  }

  function mountProfile(root) {
    const profileAvatar = root.querySelector('#profileAvatar');
    const profileName = root.querySelector('#profileName');
    const weightInput = root.querySelector('#weightInput');
    const weightDisplay = root.querySelector('#weightDisplay');
    const saveWeightBtn = root.querySelector('#saveWeightBtn');
    const changeNameBtn = root.querySelector('#changeNameBtn');
    const statusMessage = root.querySelector('#statusMessage-profile');

    function updateStatus(message, tone = 'updated') {
      if (!statusMessage) {
        return;
      }

      statusMessage.classList.remove('is-success', 'is-error', 'is-updated');
      statusMessage.classList.add(tone === 'success' ? 'is-success' : tone === 'error' ? 'is-error' : 'is-updated');
      statusMessage.textContent = message;
      statusMessage.style.display = 'block';

      if (!prefersReducedMotion) {
        void statusMessage.offsetWidth;
      }
    }

    function loadUserProfile() {
      const username = State.username || 'User';

      if (profileName) {
        profileName.textContent = username;
      }

      if (profileAvatar) {
        profileAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
        profileAvatar.alt = `${username}'s Avatar`;
      }
    }

    function loadWeight() {
      const savedWeight = State.weight;
      if (savedWeight && weightInput) {
        weightInput.value = savedWeight;
      }

      if (savedWeight && weightDisplay) {
        weightDisplay.textContent = `Current Weight: ${savedWeight} kg`;
        weightDisplay.style.display = 'block';
      }
    }

    function saveWeight() {
      const weight = weightInput ? weightInput.value.trim() : '';
      if (!weight || Number.isNaN(Number(weight)) || Number(weight) <= 0) {
        updateStatus('⚠️ Please enter a valid weight', 'error');
        return;
      }

      State.weight = weight;

      if (weightDisplay) {
        weightDisplay.textContent = `Current Weight: ${weight} kg`;
        weightDisplay.style.display = 'block';
      }

      updateStatus('✓ Profile updated successfully!', 'success');

      window.setTimeout(() => {
        if (statusMessage) {
          statusMessage.style.display = 'none';
        }
      }, 3000);
    }

    function showEditNameModal() {
      if (document.getElementById('editNameModal')) {
        return;
      }

      const currentName = State.username || '';
      const modal = document.createElement('div');
      modal.id = 'editNameModal';
      modal.className = 'name-modal-overlay';
      modal.innerHTML = `
        <div class='name-modal-content'>
          <h2 class='name-modal-title'>Change Your Name</h2>
          <p class='name-modal-text'>Update your personalized name</p>
          <input type='text' id='editNameInput' class='name-input' placeholder='Your name' maxlength='30' value='${escapeAttribute(currentName)}' autocomplete='off'>
          <div class='name-modal-buttons'>
            <button id='updateNameBtn' class='name-save-btn' type='button'>Update Name</button>
            <button id='cancelEditBtn' class='name-cancel-btn' type='button'>Cancel</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      document.body.classList.add('modal-open');

      const editInput = modal.querySelector('#editNameInput');
      const updateBtn = modal.querySelector('#updateNameBtn');
      const cancelBtn = modal.querySelector('#cancelEditBtn');

      function closeModal() {
        modal.style.opacity = '0';
        document.body.classList.remove('modal-open');
        window.setTimeout(() => {
          modal.remove();
        }, 300);
      }

      function handleNameUpdate() {
        const name = editInput ? editInput.value.trim() : '';
        if (!name) {
          if (editInput) {
            editInput.focus();
          }
          return;
        }

        State.username = name;
        loadUserProfile();
        closeModal();
        updateDashboardFromProfile();
      }

      if (editInput) {
        window.setTimeout(() => editInput.focus(), 100);
        editInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            handleNameUpdate();
          }

          if (event.key === 'Escape') {
            closeModal();
          }
        });
      }

      if (updateBtn) {
        updateBtn.addEventListener('click', handleNameUpdate);
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
      }

      return closeModal;
    }

    function updateDashboardFromProfile() {
      if (window.updateDashboard) {
        window.updateDashboard();
      }
    }

    loadUserProfile();
    loadWeight();

    if (saveWeightBtn) {
      saveWeightBtn.addEventListener('click', saveWeight);
    }

    if (changeNameBtn) {
      changeNameBtn.addEventListener('click', showEditNameModal);
    }

    window.loadUserProfile = loadUserProfile;
    window.showEditNameModal = showEditNameModal;

    return () => {
      if (window.loadUserProfile === loadUserProfile) {
        delete window.loadUserProfile;
      }

      if (window.showEditNameModal === showEditNameModal) {
        delete window.showEditNameModal;
      }
    };
  }

  function mountProgress(root) {
    const todaySteps = root.querySelector('#todaySteps');
    const weeklyTotal = root.querySelector('#weeklyTotal');
    const caloriesBurned = root.querySelector('#caloriesBurned');
    const waterIntake = root.querySelector('#waterIntake');
    const goalPercent = root.querySelector('#goalPercent');
    const activeDays = root.querySelector('#activeDays');

    function loadProgressData() {
      const summary = getDashboardSummary();
      const weeklyData = getWeeklyData();
      const today = new Date();
      const currentDay = today.getDay();
      const startOfWeek = new Date(today);
      const daysSinceMonday = (currentDay + 6) % 7;
      startOfWeek.setDate(today.getDate() - daysSinceMonday);

      let weeklySteps = 0;
      let activeDayCount = 0;

      for (let index = 0; index < 7; index += 1) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const steps = weeklyData[date.toDateString()] || 0;
        weeklySteps += steps;
        if (steps >= 1000) {
          activeDayCount += 1;
        }
      }

      if (todaySteps) {
        todaySteps.textContent = formatNumber(summary.steps);
      }

      if (weeklyTotal) {
        weeklyTotal.textContent = formatNumber(weeklySteps);
      }

      if (caloriesBurned) {
        caloriesBurned.textContent = formatNumber(Math.round(summary.steps * CALORIES_PER_STEP));
      }

      if (waterIntake) {
        waterIntake.textContent = formatNumber(summary.water);
      }

      if (goalPercent) {
        goalPercent.textContent = `${Math.min(Math.round((summary.steps / STEP_GOAL) * 100), 100)}%`;
      }

      if (activeDays) {
        activeDays.textContent = formatNumber(activeDayCount);
      }
    }

    loadProgressData();
    window.loadProgressData = loadProgressData;

    return () => {
      if (window.loadProgressData === loadProgressData) {
        delete window.loadProgressData;
      }
    };
  }

  function mountDistance(root) {
    const distanceDisplay = root.querySelector('#distanceDisplay');
    const distanceSteps = root.querySelector('#distanceSteps');
    const distanceCalories = root.querySelector('#distanceCalories');
    const durationElement = root.querySelector('#duration');
    const avgSpeedElement = root.querySelector('#avgSpeed');
    const trackingStatus = root.querySelector('#trackingStatus');
    const startBtn = root.querySelector('#startBtn');
    const stopBtn = root.querySelector('#stopBtn');
    const statusMessage = root.querySelector('#statusMessage-distance');

    let isTracking = false;
    let totalDistance = 0;
    let lastPosition = null;
    let startTime = null;
    let watchId = null;
    let timerInterval = null;

    function setStatus(message, tone = 'default') {
      if (!statusMessage) {
        return;
      }

      statusMessage.textContent = message;
      statusMessage.classList.remove('is-success', 'is-error', 'is-updated');
      statusMessage.classList.add(tone === 'success' ? 'is-success' : tone === 'error' ? 'is-error' : 'is-updated');
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
      const earthRadius = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadius * c;
    }

    function updateDistanceDisplay() {
      if (distanceDisplay) {
        distanceDisplay.textContent = `${totalDistance.toFixed(2)} km`;
      }

      if (distanceSteps) {
        distanceSteps.textContent = formatNumber(Math.round(totalDistance / STEP_LENGTH_KM));
      }

      if (distanceCalories) {
        distanceCalories.textContent = formatNumber(Math.round((totalDistance / STEP_LENGTH_KM) * CALORIES_PER_STEP));
      }
    }

    function updateTimer() {
      if (!startTime || !durationElement || !avgSpeedElement) {
        return;
      }

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      durationElement.textContent = formatTime(elapsedSeconds);

      if (elapsedSeconds > 0) {
        const avgSpeed = (totalDistance / elapsedSeconds) * 3600;
        avgSpeedElement.textContent = `${avgSpeed.toFixed(1)} km/h`;
      }
    }

    function handlePosition(position) {
      const { latitude, longitude } = position.coords;

      if (lastPosition) {
        const distance = calculateDistance(lastPosition.latitude, lastPosition.longitude, latitude, longitude);
        if (distance > 0.005) {
          totalDistance += distance;
          updateDistanceDisplay();
        }
      }

      lastPosition = { latitude, longitude };
    }

    function stopTracking(message = 'Walk completed!') {
      isTracking = false;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }

      if (timerInterval !== null) {
        window.clearInterval(timerInterval);
        timerInterval = null;
      }

      if (startBtn) {
        startBtn.style.display = 'block';
      }

      if (stopBtn) {
        stopBtn.style.display = 'none';
      }

      if (trackingStatus) {
        trackingStatus.textContent = 'Stopped';
      }

      setStatus(message, 'updated');
    }

    function handleError(error) {
      setStatus(`Unable to get location: ${error.message}`, 'error');
      stopTracking('Walk completed!');
    }

    function startTracking() {
      if (!navigator.geolocation) {
        setStatus('Geolocation not supported', 'error');
        return;
      }

      isTracking = true;
      totalDistance = 0;
      lastPosition = null;
      startTime = Date.now();
      updateDistanceDisplay();

      if (startBtn) {
        startBtn.style.display = 'none';
      }

      if (stopBtn) {
        stopBtn.style.display = 'block';
      }

      if (trackingStatus) {
        trackingStatus.textContent = 'Tracking...';
      }

      setStatus('✓ GPS tracking active', 'success');

      watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      });

      timerInterval = window.setInterval(updateTimer, 1000);
    }

    if (startBtn) {
      startBtn.addEventListener('click', startTracking);
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => stopTracking());
    }

    setStatus('Click "Start Walk" to begin tracking', 'updated');
    window.loadDistanceData = updateDistanceDisplay;

    return () => {
      stopTracking('Walk completed!');
      if (window.loadDistanceData === updateDistanceDisplay) {
        delete window.loadDistanceData;
      }
    };
  }

  function mountSettings(root) {
    const themeToggle = root.querySelector('#themeToggle');
    const themeStatus = root.querySelector('#themeStatus');
    const notificationToggle = root.querySelector('#notificationToggle');
    const notificationStatus = root.querySelector('#notificationStatus');
    const soundToggle = root.querySelector('#soundToggle');
    const soundStatus = root.querySelector('#soundStatus');

    function syncToggle(toggleElement, enabled) {
      if (!toggleElement) {
        return;
      }

      toggleElement.classList.toggle('active', enabled);
      toggleElement.setAttribute('aria-checked', enabled ? 'true' : 'false');
    }

    function flashToggle(toggleElement, statusElement) {
      if (prefersReducedMotion) {
        return;
      }

      if (toggleElement) {
        toggleElement.classList.add('is-updating');
        toggleElement.addEventListener('animationend', () => {
          toggleElement.classList.remove('is-updating');
        }, { once: true });
      }

      if (statusElement) {
        statusElement.classList.remove('is-updated');
        scheduleFrame(() => {
          statusElement.classList.add('is-updated');
          statusElement.addEventListener('animationend', () => {
            statusElement.classList.remove('is-updated');
          }, { once: true });
        });
      }
    }

    function loadTheme() {
      const isDark = State.theme === 'dark';
      document.body.classList.toggle('dark', isDark);
      syncToggle(themeToggle, isDark);
      if (themeStatus) {
        themeStatus.textContent = isDark ? 'Theme: Dark Mode' : 'Theme: Light Mode';
      }
    }

    function toggleThemeUI() {
      const isDark = typeof window.toggleThemeGlobal === 'function' ? window.toggleThemeGlobal() : !document.body.classList.contains('dark');
      State.theme = isDark ? 'dark' : 'light';
      syncToggle(themeToggle, isDark);
      if (themeStatus) {
        themeStatus.textContent = isDark ? 'Theme: Dark Mode' : 'Theme: Light Mode';
      }
      flashToggle(themeToggle, themeStatus);
    }

    function loadNotificationSetting() {
      const isOn = State.notifications !== 'off';
      State.notifications = isOn ? 'on' : 'off';
      syncToggle(notificationToggle, isOn);
      if (notificationStatus) {
        notificationStatus.textContent = isOn ? 'Notifications: On' : 'Notifications: Off';
      }
    }

    function toggleNotification() {
      const isOn = !(notificationToggle && notificationToggle.classList.contains('active'));
      State.notifications = isOn ? 'on' : 'off';
      syncToggle(notificationToggle, isOn);
      if (notificationStatus) {
        notificationStatus.textContent = isOn ? 'Notifications: On' : 'Notifications: Off';
      }
      flashToggle(notificationToggle, notificationStatus);
    }

    function loadSoundSetting() {
      const isOn = State.sound !== 'off';
      State.sound = isOn ? 'on' : 'off';
      syncToggle(soundToggle, isOn);
      if (soundStatus) {
        soundStatus.textContent = isOn ? 'Sound Effects: On' : 'Sound Effects: Off';
      }
    }

    function toggleSound() {
      const isOn = !(soundToggle && soundToggle.classList.contains('active'));
      State.sound = isOn ? 'on' : 'off';
      syncToggle(soundToggle, isOn);
      if (soundStatus) {
        soundStatus.textContent = isOn ? 'Sound Effects: On' : 'Sound Effects: Off';
      }
      flashToggle(soundToggle, soundStatus);
    }

    function onToggleKeydown(handler) {
      return (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handler();
        }
      };
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleThemeUI);
      themeToggle.addEventListener('keydown', onToggleKeydown(toggleThemeUI));
    }

    if (notificationToggle) {
      notificationToggle.addEventListener('click', toggleNotification);
      notificationToggle.addEventListener('keydown', onToggleKeydown(toggleNotification));
    }

    if (soundToggle) {
      soundToggle.addEventListener('click', toggleSound);
      soundToggle.addEventListener('keydown', onToggleKeydown(toggleSound));
    }

    loadTheme();
    loadNotificationSetting();
    loadSoundSetting();

    return () => {};
  }

  function mountAbout() {
    return () => {};
  }

  const routeMap = {
    home: {
      title: 'Welcome to FitTrack',
      subtitle: 'Your personal fitness companion',
      template: homeContent,
      mount: mountHome,
      documentTitle: 'FitTrack - Home Dashboard'
    },
    steps: {
      title: 'Step Counter',
      subtitle: 'Track your daily movement',
      template: stepsContent,
      mount: mountSteps,
      documentTitle: 'FitTrack - Step Counter'
    },
    weekly: {
      title: 'Weekly Summary',
      subtitle: 'Your weekly step progress',
      template: weeklyContent,
      mount: mountWeekly,
      documentTitle: 'FitTrack - Weekly Summary'
    },
    water: {
      title: 'Water Intake Tracker',
      subtitle: 'Stay hydrated, stay healthy',
      template: waterContent,
      mount: mountWater,
      documentTitle: 'FitTrack - Water Tracker'
    },
    quotes: {
      title: 'Daily Motivation',
      subtitle: 'Get inspired to reach your goals',
      template: quotesContent,
      mount: mountQuotes,
      documentTitle: 'FitTrack - Daily Motivation'
    },
    nutrition: {
      title: 'Nutrition Guide',
      subtitle: 'Fuel your body right',
      template: nutritionContent,
      mount: mountNutrition,
      documentTitle: 'FitTrack - Nutrition Guide'
    },
    profile: {
      title: 'User Profile',
      subtitle: 'Manage your fitness profile',
      template: profileContent,
      mount: mountProfile,
      documentTitle: 'FitTrack - Profile'
    },
    progress: {
      title: 'Progress Overview',
      subtitle: 'Your fitness journey at a glance',
      template: progressContent,
      mount: mountProgress,
      documentTitle: 'FitTrack - Progress Overview'
    },
    distance: {
      title: 'Distance Tracker',
      subtitle: 'Track how far you have walked',
      template: distanceContent,
      mount: mountDistance,
      documentTitle: 'FitTrack - Distance Tracker'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your app experience',
      template: settingsContent,
      mount: mountSettings,
      documentTitle: 'FitTrack - Settings'
    },
    about: {
      title: 'About FitTrack',
      subtitle: 'A small app built to keep the daily habits visible',
      template: aboutContent,
      mount: mountAbout,
      documentTitle: 'FitTrack - About'
    }
  };

  let activeCleanup = null;

  function mountServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('service-worker.js')
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    });
  }

  function renderRoute(route) {
    const resolvedRoute = routeMap[route] ? route : 'home';
    const definition = routeMap[resolvedRoute];
    const appRoot = document.getElementById('app');

    if (!appRoot || !definition) {
      return resolvedRoute;
    }

    if (typeof activeCleanup === 'function') {
      activeCleanup();
      activeCleanup = null;
    }

    document.title = definition.documentTitle;
    appRoot.innerHTML = shellMarkup(resolvedRoute, definition.title, definition.subtitle, definition.template());

    const loadingOverlay = document.getElementById('appLoading');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }

    const mountRoot = appRoot.querySelector('.route-view') || appRoot;
    activeCleanup = definition.mount(mountRoot) || null;

    return resolvedRoute;
  }

  function bootstrap() {
    mountServiceWorker();
  }

  window.FitTrackApp = {
    renderRoute,
    routeMap,
    state: State,
    storage: Storage,
    getDashboardSummary,
    getWeeklyData,
    updateWeeklyRecord,
    bootstrap
  };

  bootstrap();
})();