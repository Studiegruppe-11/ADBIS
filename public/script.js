document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Forhindrer standard formularindsendelse

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
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Ordre oprettet!'); // Viser en bekræftelsesbesked
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Fejl ved oprettelse af ordre.'); // Viser en fejlbesked
    });
});