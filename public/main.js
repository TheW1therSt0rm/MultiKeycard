const grid = document.getElementById('cardGrid');
let cardsState = [];
let mode = 0;

let ProfileName = "";
let email = "";
let password = "";
let id = -1;

logs = [
];

async function saveData(data) {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    console.log('Saved:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadCards() {
  try {
    const response = await fetch('/api/cards');

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const cards = await response.json();
    cardsState = cards;
    renderCardGrid(cardsState);
  } catch (error) {
    grid.innerHTML = `
      <article class="card">
        <div class="cardHeader">
          <h2>Error</h2>
          <span class="badge badge-offline">Offline</span>
        </div>
        <p class="cardText">Could not load cards. ${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

function renderCardGrid(cards) {
  grid.innerHTML = cards.map(createCardMarkup).join('');
}

function createCardMarkup(card) {
  const status = getStatusLabel(card.status);
  const statusClass = `badge-${status.toLowerCase()}`;

  return `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge ${statusClass}">${escapeHtml(status)}</span>
      </div>
      <p class="cardText">${escapeHtml(card.subtitle)}</p>
      <button
        type="button"
        class="cardButton"
        data-action="open-card"
        data-card-id="${card.id}"
      >
        Open
      </button>
    </article>
  `;
}

function getStatusLabel(status) {
  if (status === 0) {
    return 'Ready';
  }

  if (status === 2) {
    return 'Offline';
  }

  return 'Draft';
}

function openCard(cardId) {
  const card = cardsState.find((item) => String(item.id) === String(cardId));

  if (!card) {
    grid.innerHTML = `
      <article class="card">
        <div class="cardHeader">
          <h2>Not found</h2>
          <span class="badge badge-offline">Offline</span>
        </div>
        <p class="cardText">The selected card could not be found.</p>
        <button type="button" class="cardButton" data-action="go-back">Back</button>
      </article>
    `;
    return;
  }

  logs.push(`Card opened: ${card.title}`);

  handleCardAction(card);
}

function handleCardAction(card) {
  switch (card.type) {
    case 'settings':
      renderSettingsCard(card);
      break;
    case 'logs':
      renderLogsCard(card);
      break;
    case 'profile':
      renderProfileCard(card);
      break;
    case 'new-profile':
      renderNewProfileCard(card);
      break;
    default:
      renderDefaultCard(card);
      break;
  }
}

function renderDefaultCard(card) {
  grid.innerHTML = `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge badge-ready">Opened</span>
      </div>
      <p class="cardText">You pressed ${escapeHtml(card.title)}.</p>
      <button type="button" class="cardButton" data-action="go-back">Back</button>
    </article>
  `;
}

function renderSettingsCard(card) {
  grid.innerHTML = `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge badge-ready">Settings</span>
      </div>

      <p class="cardText">
        Change the mode of the external card from the dropdown below.
      </p>

      <div class="cardActions">
        <label for="modeSelect" class="dropdownLabel">Mode</label>
        <select id="modeSelect" class="cardSelect">
          <option value="credit card">Credit card</option>
          <option value="debit card">Debit Card</option>
        </select>
        <button type="button" class="cardButton" data-action="set-mode">
          Apply
        </button>
        <button type="button" class="cardButton" data-action="go-back">
          Back
        </button>
      </div>
    </article>
  `;
}

function renderLogsCard(card) {

  grid.innerHTML = `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge badge-draft">Logs</span>
      </div>

      <div class="cardText">
        <ul class="logList">
          ${logs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')}
        </ul>
      </div>

      <button type="button" class="cardButton" data-action="go-back">
        Back
      </button>
    </article>
  `;
}

function renderProfileCard(card) {

  grid.innerHTML = `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge badge-ready">Profile</span>
      </div>

      <div class="cardText">
        <p>Name: ${escapeHtml(ProfileName)}</p>
        <p>Email: ${escapeHtml(email)}</p>
        <p>Password: ${escapeHtml(password)}</p>
        <p>Id: ${escapeHtml(id)}</p>
      </div>

      <button type="button" class="cardButton" data-action="go-back">
        Back
      </button>
    </article>
  `;
}

function renderNewProfileCard(card) {

  grid.innerHTML = `
    <article class="card">
      <div class="cardHeader">
        <h2>${escapeHtml(card.title)}</h2>
        <span class="badge badge-ready">New Profile</span>
      </div>

      <div class="cardText">
        <p>Enter the name for the new profile below and press "Create".</p>
        <input type="text" id="profileNameInput" class="cardInput" placeholder="Profile name...">
        <p>Enter the email for the new profile below and press "Create".</p>
        <input type="text" id="profileEmailInput" class="cardInput" placeholder="Email...">
        <p>Enter the password for the new profile below and press "Create".</p>
        <input type="text" id="profilePasswordInput" class="cardInput" placeholder="Password...">
      </div>

      <button type="button" class="cardButton " data-action="create-profile">
        Create
      </button>

      <button type="button" class="cardButton" data-action="go-back">
        Back
      </button>
    </article>
  `;
}

function setMode(mo) {
  mode = mo === 'credit card' ? 0 : 1;

  const modeBadge = document.getElementById('modeBadge');
  if (modeBadge) {
    modeBadge.textContent = mode === 0 ? 'Credit card' : 'Debit Card';
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('.cardButton');

  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === 'go-back') {
    renderCardGrid(cardsState);
    return;
  }

  if (action === 'open-card') {
    openCard(button.dataset.cardId);
    return;
  }

  if (action === 'set-mode') {
    const modeSelect = document.getElementById('modeSelect');
    const mo = modeSelect ? modeSelect.value : button.dataset.mode;
  
    setMode(mo);
    console.log(mode);
    saveData({ id: 0, m: mode, log: logs });
  }

  if (action === 'create-profile') {
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profilePasswordInput = document.getElementById('profilePasswordInput');

    ProfileName = profileNameInput ? profileNameInput.value : 'ExampleName';
    email = profileEmailInput ? profileEmailInput.value : 'example@example.com';
    password = profilePasswordInput ? profilePasswordInput.value : 'password123';
  }
});

loadCards();