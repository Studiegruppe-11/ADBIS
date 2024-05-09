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
