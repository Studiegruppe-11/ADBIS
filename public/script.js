document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Forhindrer standard formularindsendelse

    // Samler data fra formularen
    const formData = {
        eventName: document.getElementById('eventName').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        servingTime: document.getElementById('servingTime').value,
        guests: document.getElementById('guests').value,
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
        if (!response.ok) {  // Håndterer ikke-okay respons fra serveren
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        document.getElementById('responseMessage').textContent = data.message; // Viser succesmeddelelse
        document.getElementById('responseMessage').style.color = 'green'; // Skifter tekstfarve til grøn ved succes
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('responseMessage').textContent = 'Fejl ved oprettelse af ordre: ' + error.message; // Viser fejlmeddelelse
    });
});

document.getElementById('guests').addEventListener('change', function() {
    const guests = parseInt(this.value);
    updateMenuOptions(guests);
});

function updateMenuOptions(guests) {
    const maxOptions = 3; // Max antal menuer
    let remainingGuests = guests;

    for (let i = 1; i <= maxOptions; i++) {
        const menuSelect = document.getElementById('menu' + i);
        menuSelect.innerHTML = ''; // Nulstil tidligere options

        // Beregn det maksimale antal valgmuligheder baseret på det resterende antal gæster
        const maxOptionsForMenu = Math.min(remainingGuests, guests - totalSelectedGuests(i - 1));

        // Opret valgmuligheder op til det maksimale antal for denne menu
        for (let j = 0; j <= maxOptionsForMenu; j++) {
            const option = document.createElement('option');
            option.value = j;
            option.textContent = j;
            menuSelect.appendChild(option);
        }

        // Opdater det resterende antal gæster efter valg fra den aktuelle menu
        remainingGuests -= parseInt(menuSelect.value);
    }
}

// Funktion til at beregne det samlede antal valgte gæster i de tidligere menuer
function totalSelectedGuests(menuIndex) {
    let total = 0;
    for (let i = 1; i <= menuIndex; i++) {
        total += parseInt(document.getElementById('menu' + i).value);
    }
    return total;
}

// Opdater initial options når siden indlæses
updateMenuOptions(parseInt(document.getElementById('guests').value));
