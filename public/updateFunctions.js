// /public/updateFunctions.js

function updateOrderList() {
    fetch('/api/orders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for /api/orders');
            }
            return response.json();
        })
        .then(orders => {
            const orderList = document.getElementById('orderList');
            if (orderList) {
                orderList.innerHTML = '';
                orders.forEach(order => {
                    const li = document.createElement('li');
                    li.textContent = `Order ID: ${order.id}, Event: ${order.eventName}, Date: ${order.date}, Guests: ${order.guests}`;
                    li.addEventListener('click', () => {
                        // Fetch the room ID for this order
                        fetch(`/api/orders/${order.id}/room`)
                            .then(response => response.json())
                            .then(data => {
                                order.roomId = data.roomId;
                                openOrderModal(order);
                            })
                            .catch(error => console.error('Error fetching room ID:', error));
                    });
                    orderList.appendChild(li);
                });
            } else {
                console.error('orderList element not found');
            }
        })
        .catch(error => console.error('Error fetching or updating orders:', error));
}

function openOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const modalContent = document.getElementById('modalContent');
    
    fetch(`/api/orders/${order.id}/details`)
        .then(response => response.json())
        .then(data => {
            modalContent.innerHTML = `
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${data.id}</p>
                <p><strong>Event Name:</strong> ${data.eventName}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Room ID:</strong> ${data.roomId}</p>
                <p><strong>Start Time:</strong> ${data.startTime}</p>
                <p><strong>Serve Time:</strong> ${data.servingTime}</p>
                <p><strong>End Time:</strong> ${data.endTime}</p>
                <p><strong>Number of Guests:</strong> ${data.guests}</p>
                <p><strong>Menu 1:</strong> ${data.menu1}</p>
                <p><strong>Menu 2:</strong> ${data.menu2}</p>
                <p><strong>Menu 3:</strong> ${data.menu3}</p>
                <button onclick="closeOrderModal()">Close</button>
            `;
            
            modal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching order details:', error));
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
}

window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;

function updateOrderRoomList() {
    const container = document.getElementById('orderRoom');
    if (!container) return;

    fetch('/api/orders/order-room')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for /api/orders/order-room');
            }
            return response.json();
        })
        .then(orderRooms => {
            container.innerHTML = '';
            orderRooms.forEach(relation => {
                const div = document.createElement('div');
                div.textContent = `Order ID: ${relation.orderId}, Room ID: ${relation.roomId}, Date: ${relation.date}, Start Time: ${relation.startTime}, End Time: ${relation.endTime}`;
                container.appendChild(div);
            });
        })
        .catch(err => console.error('Error fetching or updating order-room relations:', err));
}

function updateTaskList() {
    fetch('/api/tasks/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for /api/tasks/tasks');
            }
            return response.json();
        })
        .then(tasks => {
            const taskList = document.getElementById('taskList');
            if (taskList) {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    if (task.date === new Date().toISOString().slice(0, 10) && task.completed !== 1) {
                        const li = createTaskListItem(task);
                        taskList.appendChild(li);
                    }
                });
            } else {
                console.error('taskList element not found');
            }
        })
        .catch(error => console.error('Error fetching or updating tasks:', error));
}

// createTaskListItem function moved from tasks.js
function createTaskListItem(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.draggable = true;

    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'task-description';
    descriptionDiv.textContent = `${task.description} i lokale ${task.roomId}`;

    const timeAndGuestsDiv = document.createElement('div');
    timeAndGuestsDiv.className = 'task-time';
    timeAndGuestsDiv.textContent = `Kl. ${new Date(task.startTime).toLocaleTimeString('da-DK', {
        hour: '2-digit', minute: '2-digit', hour12: false
    })} - ${task.guests} Pax`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.dataset.taskId = task.taskId;

    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(document.createTextNode('\u00A0'));   

    checkbox.onchange = () => toggleTaskCompletion(task.taskId, li);

    li.appendChild(checkboxContainer);
    li.appendChild(descriptionDiv);
    li.appendChild(timeAndGuestsDiv);

    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragend', (event) => dragEnd(event, task.taskId, li));

    li.addEventListener('click', event => {
        if (event.target !== checkbox) {
            openModal(task);
        }
    });

    return li;
}

window.createTaskListItem = createTaskListItem;

let draggedItem = null;
let initialX = null;

function dragStart(event) {
    draggedItem = this;
    initialX = event.clientX;
}

function dragEnd(event, taskId, liElement) {
    const deltaX = event.clientX - initialX;
    if (Math.abs(deltaX) > window.innerWidth * 0.2) {
        const direction = deltaX > 0 ? 'right' : 'left'; 
        toggleTaskCompletion(taskId, liElement, direction);
    }
    draggedItem = null;
    initialX = null;
}

window.dragStart = dragStart;
window.dragEnd = dragEnd;

function updateOrderTasksList() {
    fetch('/api/tasks/order-tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for /api/tasks/order-tasks');
            }
            return response.json();
        })
        .then(orderTasks => {
            const container = document.getElementById('orderTasks');
            if (container) {
                container.innerHTML = '';
                orderTasks.forEach(task => {
                    const div = document.createElement('div');
                    div.textContent = `Order ID: ${task.orderId}, Task ID: ${task.taskId}, Description: ${task.description}, Completed: ${task.completed}`;
                    container.appendChild(div);
                });
            } else {
                console.error('orderTasks element not found');
            }
        })
        .catch(error => console.error('Error fetching or updating order-tasks:', error));
}

function toggleTaskCompletion(taskId, liElement, direction = null) {
    fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (direction) {
                    liElement.style.transition = 'transform 0.3s ease-out';
                    liElement.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
                    setTimeout(() => {
                        liElement.remove();
                    }, 300);
                } else {
                    updateTaskList();
                }
            } else {
                throw new Error('Failed to toggle task completion');
            }
        })
        .catch(error => console.error('Error toggling task completion:', error));
}

window.toggleTaskCompletion = toggleTaskCompletion;

function openModal(task) {
    const modal = document.getElementById('taskModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>Task Details</h2>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Room:</strong> ${task.roomId}</p>
        <p><strong>Time:</strong> ${new Date(task.startTime).toLocaleTimeString('da-DK', {
            hour: '2-digit', minute: '2-digit', hour12: false
        })}</p>
        <p><strong>Guests:</strong> ${task.guests}</p>
        <button onclick="closeModal()">Close</button>
    `;
    
    modal.style.display = 'block';
}

window.openModal = openModal;

function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
}

window.closeModal = closeModal;