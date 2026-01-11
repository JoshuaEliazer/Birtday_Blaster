// Load contacts from memory as soon as the page opens
window.onload = displayContacts;

function saveContact() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;

    if (!name || !phone || !dob) {
        alert("Please fill all fields");
        return;
    }

    // Create a contact object
    const contact = { name, phone, dob };

    // Get existing contacts from local storage or start a new list
    let contacts = JSON.parse(localStorage.getItem('myContacts')) || [];
    
    // Add new contact to the list
    contacts.push(contact);

    // Save back to local storage
    localStorage.setItem('myContacts', JSON.stringify(contacts));

    // Clear inputs and refresh list
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('dob').value = '';
    displayContacts();
}

function displayContacts() {
    const listDiv = document.getElementById('contactList');
    const contacts = JSON.parse(localStorage.getItem('myContacts')) || [];
    const today = new Date().toISOString().slice(5, 10); // Gets "MM-DD" format

    listDiv.innerHTML = ''; // Clear current list

    contacts.forEach((person, index) => {
        const personBday = person.dob.slice(5, 10); // Gets "MM-DD" from their DOB
        const isBirthday = today === personBday;

        listDiv.innerHTML += `
            <div class="contact-card ${isBirthday ? 'birthday-highlight' : ''}">
                <div>
                    <strong>${person.name}</strong><br>
                    <small>${person.dob}</small>
                </div>
                <button onclick="sendWhatsApp('${person.phone}', '${person.name}')">
                    ${isBirthday ? '🎊 Wish Now' : 'Send'}
                </button>
            </div>
        `;
    });
}

function sendWhatsApp(phone, name) {
    const msg = `Happy Birthday ${name}! Hope you have a fantastic day! 🎂🎈`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}