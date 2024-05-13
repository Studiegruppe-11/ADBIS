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
                li.className = 'task-item';

                // Beskrivelse og lokale ID
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'task-description';
                descriptionDiv.textContent = `${task.description} i lokale ${task.roomId}`;

                // Tid og antal personer
                const timeAndGuestsDiv = document.createElement('div');
                timeAndGuestsDiv.className = 'task-time';
                timeAndGuestsDiv.textContent = `Kl. ${new Date(task.startTime).toLocaleTimeString('da-DK', {
                    hour: '2-digit', minute: '2-digit', hour12: false
                })} - ${task.guests} Pax`;

                // Checkbox til markering af opgave som fuldført
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.dataset.taskId = task.taskId;

                // Tilføjelse af checkbox til starten af li-elementet
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'checkbox-container';
                checkboxContainer.appendChild(checkbox);
                checkboxContainer.appendChild(document.createTextNode('\u00A0'));

                // Håndtering af checkbox ændringer
                checkbox.onchange = () => toggleTaskCompletion(task.taskId, li);

                // Samling af alle dele
                li.appendChild(checkboxContainer);
                li.appendChild(descriptionDiv);
                li.appendChild(timeAndGuestsDiv);

                // Tilføjelse af drag-and-drop funktionalitet
                li.setAttribute('draggable', true);
                li.addEventListener('dragstart', dragStart);
                li.addEventListener('dragend', event => dragEnd(event, task.taskId, li));

                // Åbne modal ved klik uden på checkbox
                li.addEventListener('click', event => {
                    if (event.target !== checkbox) {
                        openModal(task);
                    }
                });

                // Tilføjer det færdige listeelement til DOM'en
                taskList.appendChild(li);
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
        modalContent.textContent = `Opgave: ${task.description} \nLokale: ${task.roomId} \nTid: ${new Date(task.startTime).toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit', hour12: false})} - ${new Date(task.endTime).toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit', hour12: false})} \nAntal gæster: ${task.guests}`;
        
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

document.getElementById('adminButton').addEventListener('click', function() {
    var adminLinks = document.getElementById('adminLinks');
    if (adminLinks.style.display === 'none' || adminLinks.style.display === '') {
        adminLinks.style.display = 'block'; // Shows the admin links
    } else {
        adminLinks.style.display = 'none'; // Hides the admin links
    }
});

