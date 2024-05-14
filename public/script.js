// /public/script.js
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Forhindrer standard formularindsendelse

    // Samler data fra formularen
    const formData = {
        eventName: document.getElementById('eventName').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        servingTime: document.getElementById('servingTime').value,
        guests: parseInt(document.getElementById('guests').value, 10),
        menu1: document.getElementById('menu1').value,
        menu2: document.getElementById('menu2').value,
        menu3: document.getElementById('menu3').value
    };

    // Udfører POST-anmodning til serveren med form data
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('responseMessage').textContent = data.message;
        document.getElementById('responseMessage').style.color = '#a067c7';
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('responseMessage').textContent = 'Fejl ved oprettelse af ordre: ' + error.message;
    });
});

document.getElementById('guests').addEventListener('change', function() {
    updateMenuOptions(parseInt(this.value, 10));
});

function updateMenuOptions(guests) {
    const maxOptions = 3; // Max antal menuer
    for (let i = 1; i <= maxOptions; i++) {
        const menuSelect = document.getElementById('menu' + i);
        menuSelect.innerHTML = ''; // Nulstil tidligere options

        // Opret valgmuligheder op til det totale antal gæster
        for (let j = 0; j <= guests; j++) {
            const option = document.createElement('option');
            option.value = j;
            option.textContent = j;
            menuSelect.appendChild(option);
        }
    }
}

// Kald updateMenuOptions når siden indlæses, hvis der er en værdi
window.addEventListener('DOMContentLoaded', (event) => {
    const initialGuests = parseInt(document.getElementById('guests').value, 10);
    if (!isNaN(initialGuests)) {
        updateMenuOptions(initialGuests);
    }
});

document.getElementById('adminButton').addEventListener('click', function() {
    var adminLinks = document.getElementById('adminLinks');
    if (adminLinks.style.display === 'block') {
        adminLinks.style.display = 'none';
    } else {
        adminLinks.style.display = 'block';
    }
});
