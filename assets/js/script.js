$(document).ready(function() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks); // Render the tasks on page load

    // Show the modal to add a new task when the "Add Task" button is clicked
    $('#addTaskBtn').click(function() {
        $('#taskModal').show(); // Display modal
    });

    // Hide the modal when the close button is clicked
    $('.close').click(function() {
        $('#taskModal').hide(); // Close modal
    });

    // Handle form submission to add a new task
    $('#taskForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        const deadline = $('#deadline').val();
        const now = dayjs().format('YYYY-MM-DD');

        // If the deadline is in the past, show a notice
        if (dayjs(deadline).isBefore(now)) {
            $('#pastDeadlineNotice').show(); // Display notice
            return; // Stop the form submission and wait for user confirmation
        }

        saveTask(); // Proceed with saving the task
    });

    // When user clicks "I understand" on the notice, proceed with task saving
    $('#understandBtn').click(function() {
        $('#pastDeadlineNotice').hide(); // Hide the notice
        saveTask(); // Proceed with saving the task
    });

    // Function to save a new task and re-render the task board
    function saveTask() {
        let newTask = {
            id: Date.now(), // Unique task ID based on timestamp
            title: $('#title').val(),
            description: $('#description').val(),
            deadline: $('#deadline').val(), // Set the deadline from form input
            state: 'not-started' // Default state is 'not-started'
        };
        tasks.push(newTask); // Add the new task to the array
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save tasks to localStorage
        renderTasks(tasks); // Re-render tasks
        $('#taskModal').hide(); // Close modal
        $('#taskForm')[0].reset(); // Reset form fields
    }

    // Function to render tasks in their respective columns based on state
    function renderTasks(tasks) {
        $('#not-started-tasks, #in-progress-tasks, #completed-tasks').empty(); // Clear previous task cards

        tasks.forEach(task => {
            let taskCard = `
                <div class="task-card" id="${task.id}">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Due: ${dayjs(task.deadline).format('MM/DD/YYYY')}</p>
                    <button class="delete-task">Delete</button>
                </div>
            `;

            if (task.state === 'not-started') {
                $('#not-started-tasks').append(taskCard);
            } else if (task.state === 'in-progress') {
                $('#in-progress-tasks').append(taskCard);
            } else if (task.state === 'completed') {
                $('#completed-tasks').append(taskCard);
            }

          // Color-code tasks based on state or deadline proximity
if (task.state === 'in-progress') {
    const now = dayjs();
    const deadline = dayjs(task.deadline);
    if (now.isAfter(deadline)) {
        $(`#${task.id}`).css('background-color', 'red'); // Overdue task
    } else if (deadline.diff(now, 'days') < 3) {
        $(`#${task.id}`).css('background-color', '#FFEB3B'); // Nearing deadline
    } else {
        $(`#${task.id}`).css('background-color', 'blue'); // In Progress but not near deadline
    }
} else if (task.state === 'completed') {
    $(`#${task.id}`).css('background-color', 'green');
} else {
    const now = dayjs();
    const deadline = dayjs(task.deadline);
    if (now.isAfter(deadline)) {
        $(`#${task.id}`).css('background-color', 'red');
    } else if (deadline.diff(now, 'days') < 3) {
        $(`#${task.id}`).css('background-color', '#FFEB3B'); // Near deadline
    } else {
        $(`#${task.id}`).css('background-color', 'white');
    }
}

            // Add delete functionality
            $(`#${task.id} .delete-task`).click(function() {
                tasks = tasks.filter(t => t.id !== task.id); // Remove task from array
                localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks
                renderTasks(tasks); // Re-render tasks after deletion
            });
        });

        // Make task cards draggable for drag-and-drop functionality
        $('.task-card').draggable({
            revert: 'invalid', // Revert if not dropped in a valid location
            stack: ".task-card" // Stack draggable elements on top
        });

        // Allow task cards to be dropped in different columns
        $('.column').droppable({
            accept: '.task-card', // Accept only task cards
            drop: function(event, ui) {
                let taskId = ui.helper.attr('id'); // Get the dragged task's ID
                let newState = $(this).attr('id').replace('-tasks', ''); // Determine new state
                tasks = tasks.map(task => {
                    if (task.id == taskId) {
                        task.state = newState; // Update task's state
                    }
                    return task;
                });
                localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks
                renderTasks(tasks); // Re-render tasks after state change
            }
        });
    }
});
