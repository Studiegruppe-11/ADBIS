// public/script.js
window.onload = () => {
    fetch('/api/orders/tasks') // Ændret endpoint-stien til at hente opgaver
      .then(response => response.json())
      .then(tasks => {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '<h2>Opgaver:</h2>';
        tasks.forEach(task => {
          tasksList.innerHTML += `<p>${task.description}</p>`;
        });
      })
      .catch(error => {
        console.error('Fejl ved hentning af opgaveliste:', error);
      });
  };
  
  