// /public/tasks.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            console.log('Tasks received:', tasks); 
            const taskList = document.getElementById('taskList');
            tasks.forEach(task => {
                const li = document.createElement('li');
                // Opdateret for at inkludere lokalenummer og opgavebeskrivelse
                li.textContent = `Lokale ${task.roomId}: ${task.description} - ${task.date} kl. ${task.startTime}`;
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.onchange = () => toggleTaskCompletion(task.taskId);
                li.appendChild(checkbox);
                taskList.appendChild(li);
            });
        });


    function toggleTaskCompletion(taskId) {
        fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update task');
                alert('Opgave opdateret!');
            })
            .catch(error => alert('Fejl: ' + error.message));
    }
});
