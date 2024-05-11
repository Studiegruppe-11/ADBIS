document.addEventListener('DOMContentLoaded', function() {
    fetchTasks(); // Initial fetch of tasks when the page loads
});

let draggedItem = null;
let initialX = null;

function fetchTasks() {
    const today = new Date().toISOString().slice(0, 10);
    fetch('/api/tasks/tasks')
    .then(response => response.json())
    .then(tasks => {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        tasks.forEach(task => {
            if (task.date === today && task.completed !== 1) {
                const li = document.createElement('li');
                li.textContent = `${task.description} i lokale ${task.roomId}`;
                const timeAndGuests = document.createElement('span');
                timeAndGuests.textContent = `${new Date(task.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${task.guests} Pax`; // Tilføjelse af "guests" attributten til teksten
                li.appendChild(timeAndGuests);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.dataset.taskId = task.taskId;
                checkbox.onchange = () => toggleTaskCompletion(task.taskId, li);
                const checkboxContainer = document.createElement('label'); // Wrap checkbox in a label
                checkboxContainer.appendChild(checkbox);
                checkboxContainer.appendChild(document.createTextNode('\u00A0')); // Add some spacing
                li.prepend(checkboxContainer); // Prepend the checkbox to the li
                taskList.appendChild(li);

                // Tilføj eventlistener til at åbne modalboksen når der klikkes på <li> elementet
                li.addEventListener('click', () => openModal(task));
                
                // Tilføj eventlisteners til træk-og-slip-funktionaliteten
                li.setAttribute('draggable', true);
                li.addEventListener('dragstart', dragStart);
                li.addEventListener('dragend', dragEnd);
            }
        });
    })
    .catch(error => console.error('Error loading tasks:', error));
}

function toggleTaskCompletion(taskId, liElement) {
    fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.completed === 1) {
            liElement.classList.add('completed'); // Tilføj klassen for at animere
            setTimeout(() => liElement.remove(), 300); // Fjern elementet efter animationen
        } else {
            liElement.classList.remove('completed'); // Fjern klassen for at stoppe animationen
        }
    })
    .catch(error => console.error('Error:', error));
}

function openModal(task) {
    if (event.target.type !== 'checkbox') {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '10px';
        modalContent.textContent = `Opgave: ${task.description} \nLokale: ${task.roomId} \nTid: ${new Date(task.startTime).toLocaleTimeString()} - ${new Date(task.endTime).toLocaleTimeString()} \nAntal gæster: ${task.guests}`;
        
        modal.appendChild(modalContent);
        modal.onclick = () => modal.remove(); // Fjern modal ved klik uden for indholdet
        
        document.body.appendChild(modal);
    }
}

function dragStart(event) {
    draggedItem = this;
    initialX = event.clientX;
}

function dragEnd(event) {
    if (draggedItem) {
        const deltaX = event.clientX - initialX;
        if (deltaX < -(window.innerWidth * 0.2)) {
            const taskId = draggedItem.querySelector('input[type="checkbox"]').dataset.taskId;
            toggleTaskCompletion(taskId, draggedItem);
        }
        draggedItem = null;
        initialX = null;
    }
}
