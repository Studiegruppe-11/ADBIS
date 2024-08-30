// /public/socket-handler.js
const socket = io();

function initializeSocketListeners() {
    socket.on('newOrder', (data) => {
        console.log('New order received:', data);
        updateAllLists();
    });

    socket.on('updateOrders', () => {
        console.log('Orders updated');
        updateAllLists();
    });

    socket.on('updateTasks', () => {
        console.log('Tasks updated');
        updateAllLists();
    });

    socket.on('taskUpdated', (data) => {
        console.log('Task updated:', data);
        updateAllLists();
    });
}

function updateAllLists() {
    const currentPage = window.location.pathname;
    if (currentPage === '/orders' || currentPage === '/api/orders') {
        if (typeof updateOrderList === 'function' && document.getElementById('orderList')) {
            updateOrderList();
        }
    } else if (currentPage === '/tasks' || currentPage === '/api/tasks/tasks') {
        if (typeof updateTaskList === 'function' && document.getElementById('taskList')) {
            updateTaskList();
        }
    } else if (currentPage === '/orderroom' || currentPage === '/api/orders/order-room') {
        if (typeof updateOrderRoomList === 'function' && document.getElementById('orderRoom')) {
            updateOrderRoomList();
        }
    } else if (currentPage === '/api/tasks/order-tasks') {
        if (typeof updateOrderTasksList === 'function' && document.getElementById('orderTasks')) {
            updateOrderTasksList();
        }
    }
}

initializeSocketListeners();