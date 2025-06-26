const apiUrl = 'http://localhost:80/items';

async function loadItems() {
  const res = await fetch(apiUrl);
  const data = await res.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form').onsubmit = async e => {
    e.preventDefault();
    const value = document.getElementById('item').value.trim();
    if (!value) return;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ item: value })
    });

    loadItems();
    document.getElementById('item').value = '';
  };

  loadItems();
});
