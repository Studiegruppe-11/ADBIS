document.addEventListener('DOMContentLoaded', function() {
    fetchTasks();

    function fetchTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(data => displayTasks(data))
            .catch(error => console.error('Error:', error));
    }

    function displayTasks(tasks) {
        const taskList = document.getElementById('taskList');
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.description} i lokale ${task.room} kl. ${task.time}`;
            taskList.appendChild(li);
        });
    }
});