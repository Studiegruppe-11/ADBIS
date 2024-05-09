// /public/tasks.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/tasks')
      .then(response => response.json())
      .then(tasks => {
        const taskList = document.getElementById('taskList');
        tasks.forEach(task => {
          const li = document.createElement('li');
          li.textContent = `${task.description} i lokale ${task.roomId} - ${task.date} kl. ${task.startTime}`;
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
            location.reload();  // Genindlæser siden for at vise den opdaterede opgavestatus
          })
          .catch(error => alert('Fejl: ' + error.message));
      }
      
  });
  