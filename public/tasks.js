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
        console.log("Attempting to toggle completion for task", taskId); // Log which task is being toggled
        fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' })
          .then(response => {
            if (!response.ok) throw new Error('Failed to update task');
            console.log(`Task ${taskId} updated successfully`); // Log successful update
            location.reload();  // Genindlæser siden for at vise den opdaterede opgavestatus
          })
          .catch(error => {
            console.error('Error toggling task:', error); // Log any errors that occur
            alert('Fejl: ' + error.message);
          });
      }
      
  });
  