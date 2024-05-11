// /public/tasks.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
        console.log('Tasks received:', tasks); // Log for at se, om dataene er modtaget korrekt
        const taskList = document.getElementById('taskList');
        if (taskList) {
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `Lokale ${task.roomId || 'N/A'}: ${task.description} - ${task.date} kl. ${task.startTime}`;
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.onchange = () => toggleTaskCompletion(task.taskId);
                li.appendChild(checkbox);
                taskList.appendChild(li);
            });
        }
    })
    .catch(error => console.error('Error loading tasks:', error));
});


function toggleTaskCompletion(taskId) {
    fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
    .then(response => response.json())
    .then(data => alert('Opgave opdateret!'))
    .catch(error => alert('Fejl: ' + error.message));
}

