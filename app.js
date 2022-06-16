(function() {
    let users = [];
    let tasks = [];
    const taskList = document.getElementById('todo-list');
    const userList = document.getElementById('user-todo');
    const form = document.querySelector('form');
    
    document.addEventListener('DOMContentLoaded', loadData);
    form.addEventListener('submit', handleSubmit);
    
    function addUserOption(user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.innerText = user.name;
        userList.append(option);
    }
    
    function removeTask(taskId){
       tasks = tasks.filter(task => task.id !== taskId);
       const task = taskList.querySelector(`[data-id="${taskId}"]`);
       task.querySelector('input').removeEventListener('change', handleTaskStatus);
       task.querySelector('.close').removeEventListener('click', handleClose);
    
       task.remove();
    }
    
    function alertError(error) {
        alert(error.message);
    }
    
    function getUserName(id) {
        const user = users.find(us => us.id === id);
        return user.name;
    }
    
    function drawTask({userId, id, title, completed}) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = id;
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;
    
        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTaskStatus);
    
        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.className = 'close';
        close.addEventListener('click', handleClose);
    
        li.append(close);
        li.prepend(status);
    
        taskList.prepend(li);
    }
    
    function loadData() {
        Promise.all([getAllTasks(), getAllUsers()]).then(values => {
            [tasks, users] = values;
    
            tasks.forEach(task => drawTask(task));
            users.forEach(user => addUserOption(user));
        })
    }
    
    function handleSubmit(event) {
        event.preventDefault();
    
        createTask({
            userId: Number(form.user.value),
            title: form.todo.value,
            completed: false,
        });
    }
    
    function handleTaskStatus() {
        const taskId = this.parentElement.dataset.id;
        const completed = this.checked;
        changeTaskStatus(taskId, completed);
    }
    
    function handleClose() {
        const taskId = this.parentElement.dataset.id;
        deleteTask(taskId);
    }
    
    async function getAllTasks() {
        try{
            const data = await (await fetch('https://jsonplaceholder.typicode.com/todos?_limit=30')).json();
            return data;       
    
        } catch(error){
            alertError(error);
        }
    }
    
    async function getAllUsers() {
        try{
            const data = await (await fetch('https://jsonplaceholder.typicode.com/users')).json();
            return data;
            
        } catch(error){
            alertError(error);
        }
    }
    
    async function createTask(task) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(task),
                headers: {
                    'Content-type': 'application/json',
                },
            });
        
            const newTask = await response.json();
        
            drawTask(newTask);   
        } catch (error) {
            alertError(error);
        }
    }
    
    async function changeTaskStatus(taskId, status) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({completed: status}),
                headers: {
                    'Content-type': 'application/json',
                },
            });
        
            if(!response.ok){
                throw new Error('Failed to connect with the server! Try later.')
            }        
        } catch (error) {
            alertError(error);
        }
    }
    
    async function deleteTask(taskId) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                },
            });
        
            if(response.ok){
                removeTask(taskId);
            } else {
                throw new Error('Failed to connect with the server! Try later.')
            }        
        } catch (error) {
            alertError(error);
        }
    }
})()