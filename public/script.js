// /public/script.js

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    initializeSocketListeners();

    const form = document.getElementById('orderForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const jsonData = Object.fromEntries(formData);

            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                showOrderPopup(data, jsonData);
                socket.emit('newOrder', data);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            });
        });
    }

    // Update the appropriate list when the page loads
    const currentPage = window.location.pathname;
    if (currentPage === '/orders' || currentPage === '/api/orders') {
        updateOrderList();
        // Add event listener for modal close button
        const modal = document.getElementById('orderModal');
        if (modal) {
            window.onclick = function(event) {
                if (event.target == modal) {
                    closeOrderModal();
                }
            }
        }
    } else if (currentPage === '/tasks' || currentPage === '/api/tasks/tasks') {
        updateTaskList();
    } else if (currentPage === '/orderroom' || currentPage === '/api/orders/order-room') {
        updateOrderRoomList();
    } else if (currentPage === '/api/tasks/order-tasks') {
        updateOrderTasksList();
    }

    const guestsInput = document.getElementById('guests');
    if (guestsInput) {
        guestsInput.addEventListener('change', function() {
            updateMenuOptions(parseInt(this.value, 10));
        });

        // Call updateMenuOptions initially
        updateMenuOptions(parseInt(guestsInput.value, 10) || 1);
    }

    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            var adminLinks = document.getElementById('adminLinks');
            if (adminLinks.style.display === 'block') {
                adminLinks.style.display = 'none';
            } else {
                adminLinks.style.display = 'block';
            }
        });
    }

    updateAllLists();
});

function showOrderPopup(responseData, orderData) {
    const popup = document.createElement('div');
    popup.className = 'order-popup';
    
    popup.innerHTML = `
        <div class="order-popup-content">
            <h2>Order Confirmation</h2>
            <p><strong>Event Name:</strong> ${orderData.eventName}</p>
            <p><strong>Date:</strong> ${orderData.date}</p>
            <p><strong>Allocated Room:</strong> ${responseData.roomId}</p>
            <p><strong>Start Time:</strong> ${orderData.startTime}</p>
            <p><strong>End Time:</strong> ${orderData.endTime}</p>
            <p><strong>Serving Time:</strong> ${orderData.servingTime}</p>
            <p><strong>Number of Guests:</strong> ${orderData.guests}</p>
            <p><strong>Menu 1:</strong> ${orderData.menu1}</p>
            <p><strong>Menu 2:</strong> ${orderData.menu2}</p>
            <p><strong>Menu 3:</strong> ${orderData.menu3}</p>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function updateMenuOptions(guests) {
    const menuSelects = [
        document.getElementById('menu1'),
        document.getElementById('menu2'),
        document.getElementById('menu3')
    ];

    menuSelects.forEach((select) => {
        if (select) {
            select.innerHTML = '<option value="0">0</option>';
            for (let i = 1; i <= guests; i++) {
                const optionElement = document.createElement('option');
                optionElement.value = i.toString();
                optionElement.textContent = i.toString();
                select.appendChild(optionElement);
            }
        }
    });
}