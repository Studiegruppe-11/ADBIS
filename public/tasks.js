// /public/tasks.js

document.addEventListener('DOMContentLoaded', function() {
    
    function completeTask(taskId) {
        fetch(`/api/tasks/tasks/${taskId}/complete`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                console.log('Task completed:', data);
                socket.emit('taskCompleted', { taskId });
            })
            .catch(error => console.error('Error completing task:', error));
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
                                liElement.remove();
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



    document.getElementById('adminButton').addEventListener('click', function() {
        var adminLinks = document.getElementById('adminLinks');
        if (adminLinks.style.display === 'none' || adminLinks.style.display === '') {
            adminLinks.style.display = 'block'; 
        } else {
            adminLinks.style.display = 'none'; 
        }
    });

});

