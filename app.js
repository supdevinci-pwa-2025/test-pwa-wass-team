// Vérifie que le navigateur supporte les service workers.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => {
        console.log('✅ Service Worker enregistré');

        // 🔄 Rechargement à chaud si update
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                const updateDiv = document.createElement('div');
                updateDiv.innerHTML = `
                  <div style="background:#f77f00; color:white; padding:1rem; text-align:center;">
                    🔄 Nouvelle version disponible.
                    <button style="margin-left:1rem;" onclick="window.location.reload()">Mettre à jour</button>
                  </div>
                `;
                document.body.prepend(updateDiv);
              }
            }
          };
        };
      })
      .catch(err => console.error('❌ Erreur Service Worker :', err));
  });
}

// === TOUT LE RESTE DE L’APP ===

const form = document.getElementById('snack-form');
const snackList = document.getElementById('snack-list');
const nameInput = document.getElementById('snack-name');
const moodInput = document.getElementById('snack-mood');

function generateId() {
  return Date.now().toString();
}

function createSnackElement(snack) {
  const li = document.createElement('li');
  li.textContent = `🍪 ${snack.name} – humeur : ${snack.mood}`;
  li.style.cursor = 'pointer';
  li.title = 'Clique pour supprimer';
  li.dataset.id = snack.id;

  li.addEventListener('click', () => {
    if (confirm('Supprimer ce snack ?')) {
      const snacks = JSON.parse(localStorage.getItem('snacks')) || [];
      const updatedSnacks = snacks.filter(s => s.id !== snack.id);
      localStorage.setItem('snacks', JSON.stringify(updatedSnacks));
      refreshSnackList();
    }
  });

  return li;
}

function refreshSnackList() {
  snackList.innerHTML = '';
  const snacks = JSON.parse(localStorage.getItem('snacks')) || [];
  snacks.forEach(snack => {
    const li = createSnackElement(snack);
    snackList.appendChild(li);
  });
}

// Chargement initial
refreshSnackList();

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const mood = moodInput.value.trim();

  if (name && mood) {
    const snacks = JSON.parse(localStorage.getItem('snacks')) || [];
    const newSnack = {
      id: generateId(),
      name,
      mood
    };
    snacks.push(newSnack);
    localStorage.setItem('snacks', JSON.stringify(snacks));

    refreshSnackList();
    form.reset();
  }
});

function readCSV() {
  const fileInput = document.getElementById('csvFile');
  const ul = document.getElementById('participants');

  if (!fileInput?.files?.length) return alert("Aucun fichier sélectionné");

  const reader = new FileReader();
  reader.onload = function (e) {
    const lignes = e.target.result.split('\n');
    ul.innerHTML = '';
    lignes.forEach(ligne => {
      const [nom, humeur] = ligne.split(',');
      if (nom && humeur) {
        const li = document.createElement('li');
        li.textContent = `👤 ${nom.trim()} – humeur : ${humeur.trim()}`;
        ul.appendChild(li);
      }
    });
  };
  reader.readAsText(fileInput.files[0]);
}
