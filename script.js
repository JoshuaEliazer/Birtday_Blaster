// Birthday Blaster - improved script
// Load contacts and wire controls when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  displayContacts();
  document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm('Clear all contacts?')) {
      localStorage.removeItem('myContacts');
      displayContacts();
    }
  });
});

/* Utilities */

function getTodayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

// Accepts YYYY-MM-DD or Date string; returns MM-DD
function extractMMDD(dob) {
  if (!dob) return '';
  // Prefer splitting the standard HTML date YYYY-MM-DD to avoid timezone differences
  if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return dob.slice(5, 10); // "MM-DD"
  }
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function sanitizePhoneForWa(phone) {
  // Remove everything except digits and plus sign
  if (!phone) return '';
  // keep leading + if present, but wa.me expects no plus; we'll strip plus and spaces
  const digits = phone.replace(/\D/g, '');
  return digits; // wa.me requires country code and digits only
}

function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Main functions */

function saveContact() {
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const dobEl = document.getElementById('dob');

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const dob = dobEl.value; // HTML date input value is YYYY-MM-DD

  if (!name || !phone || !dob) {
    alert('Please fill all fields');
    return;
  }

  const sanitizedPhone = sanitizePhoneForWa(phone);
  if (sanitizedPhone.length < 6) {
    alert('Please enter a valid phone number with country code (digits only).');
    return;
  }

  // Create a contact object
  const contact = { name, phone: sanitizedPhone, dob };

  // Get existing contacts from local storage or start a new list
  const contacts = JSON.parse(localStorage.getItem('myContacts')) || [];

  // Optional: prevent exact duplicate (same phone)
  const exists = contacts.some(c => c.phone === contact.phone);
  if (exists) {
    if (!confirm('A contact with this phone already exists. Add duplicate?')) {
      return;
    }
  }

  // Add new contact to the list
  contacts.push(contact);

  // Save back to local storage
  localStorage.setItem('myContacts', JSON.stringify(contacts));

  // Clear inputs and refresh list
  nameEl.value = '';
  phoneEl.value = '';
  dobEl.value = '';
  displayContacts();
}

function displayContacts() {
  const listDiv = document.getElementById('contactList');
  const contacts = JSON.parse(localStorage.getItem('myContacts')) || [];
  const today = getTodayMMDD(); // "MM-DD"

  listDiv.innerHTML = ''; // Clear current list

  if (!contacts.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No contacts yet. Add someone above.';
    listDiv.appendChild(empty);
    return;
  }

  contacts.forEach((person, index) => {
    const personBday = extractMMDD(person.dob);
    const isBirthday = today === personBday;

    const card = document.createElement('div');
    card.className = 'contact-card' + (isBirthday ? ' birthday-highlight' : '');

    const meta = document.createElement('div');
    meta.className = 'meta';
    // Use escaped name to avoid injecting HTML
    meta.innerHTML = `<strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.dob)}</small>`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.textContent = isBirthday ? '🎊 Wish Now' : 'Send';
    sendBtn.addEventListener('click', () => sendWhatsApp(person.phone, person.name));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete contact "${person.name}"?`)) {
        removeContactAt(index);
      }
    });

    actions.appendChild(sendBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(meta);
    card.appendChild(actions);
    listDiv.appendChild(card);
  });
}

function removeContactAt(index) {
  const contacts = JSON.parse(localStorage.getItem('myContacts')) || [];
  if (index < 0 || index >= contacts.length) return;
  contacts.splice(index, 1);
  localStorage.setItem('myContacts', JSON.stringify(contacts));
  displayContacts();
}

function sendWhatsApp(phone, name) {
  const sanitized = sanitizePhoneForWa(phone);
  if (!sanitized) {
    alert('Invalid phone number.');
    return;
  }

  // Compose a nice message; use encodeURIComponent for safety
  const msg = `Happy Birthday ${name}! Hope you have a fantastic day! 🎂🎈`;
  const url = `https://wa.me/${sanitized}?text=${encodeURIComponent(msg)}`;

  // Open in a new tab
  window.open(url, '_blank');
}
