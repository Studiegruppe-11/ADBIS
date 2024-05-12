// /public/tasks.js

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

function toggleTaskCompletion(taskId, liElement, direction) {
    fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.completed === 1) {
            // Start "flyve ud" animation
            liElement.style.transform = `translateX(${direction === 'left' ? '-' : ''}100%)`;
            liElement.style.opacity = '0';
            liElement.addEventListener('transitionend', (event) => {
                if (event.propertyName === 'opacity') {
                    // Start collapse af element efter "flyve ud"
                    liElement.style.height = '0';
                    liElement.style.margin = '0';
                    liElement.style.padding = '0';
                    liElement.addEventListener('transitionend', (event) => {
                        if (event.propertyName === 'height') {
                            liElement.remove(); // Fjern element når højde-transition er fuldført
                        }
                    });
                }
            });
        } else {
            // Håndter genaktivering af en opgave
            liElement.style.opacity = '1';
            liElement.style.transform = 'translateX(0)';
            liElement.style.height = ''; // Genopretter fuld højde
            liElement.style.margin = ''; // Genopretter margin
            liElement.style.padding = ''; // Genopretter padding
        }
    })
    .catch(error => console.error('Error:', error));
}






// Popup til visning af information om opgaver
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


// Logik til at kunne dragge en opgave og markere som færdig
function dragStart(event) {
    draggedItem = this;
    initialX = event.clientX;
}

function dragEnd(event) {
    const deltaX = event.clientX - initialX;
    if (Math.abs(deltaX) > window.innerWidth * 0.2) { // Kræver et træk på mindst 20% af skærmens bredde
        const direction = deltaX > 0 ? 'right' : 'left'; 
        toggleTaskCompletion(draggedItem.querySelector('input[type="checkbox"]').dataset.taskId, draggedItem, direction);
    }
    draggedItem = null;
    initialX = null;
}

