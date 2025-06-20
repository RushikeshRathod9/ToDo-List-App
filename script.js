// Todo App Class - Object-Oriented Approach
class TodoApp {
    constructor(username) {
        this.username = username || (window.getCurrentUser && window.getCurrentUser());
        // Initialize properties
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        // Get DOM elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearBtn = document.getElementById('clearCompleted');
        
        // Stats elements
        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');
        
        // Initialize the app
        this.init();
    }
    
    // Initialize event listeners and load data
    init() {
        this.loadTodosFromStorage();
        this.setupEventListeners();
        this.render();
    }
    
    // Set up all event listeners
    setupEventListeners() {
        // Add todo on button click
        this.addBtn.addEventListener('click', () => this.addTodo());
        
        // Add todo on Enter key press
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed todos
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        
        // Todo list event delegation
        this.todoList.addEventListener('click', (e) => this.handleTodoClick(e));
        this.todoList.addEventListener('keypress', (e) => this.handleTodoKeypress(e));
    }
    
    // Add new todo
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            this.showMessage('Please enter a task!', 'error');
            return;
        }
        
        if (text.length > 100) {
            this.showMessage('Task is too long! Maximum 100 characters.', 'error');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodosToStorage();
        this.render();
        this.showMessage('Task added successfully!', 'success');
    }
    
    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodosToStorage();
            this.render();
        }
    }
    
    // Delete todo
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodosToStorage();
            this.render();
            this.showMessage('Task deleted!', 'info');
        }
    }
    
    // Start editing todo
    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.render();
        }
    }
    
    // Save edited todo
    saveEdit(id, newText) {
        const text = newText.trim();
        
        if (text === '') {
            this.showMessage('Task cannot be empty!', 'error');
            return;
        }
        
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            this.editingId = null;
            this.saveTodosToStorage();
            this.render();
            this.showMessage('Task updated!', 'success');
        }
    }
    
    // Cancel editing
    cancelEdit() {
        this.editingId = null;
        this.render();
    }
    
    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.render();
    }
    
    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showMessage('No completed tasks to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodosToStorage();
            this.render();
            this.showMessage('Completed tasks cleared!', 'success');
        }
    }
    
    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    // Handle todo list clicks
    handleTodoClick(e) {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const id = parseInt(todoItem.dataset.id);
        
        if (e.target.classList.contains('todo-checkbox')) {
            this.toggleTodo(id);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            this.deleteTodo(id);
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            this.startEdit(id);
        } else if (e.target.classList.contains('save-btn')) {
            const input = todoItem.querySelector('.edit-input');
            this.saveEdit(id, input.value);
        } else if (e.target.classList.contains('cancel-btn')) {
            this.cancelEdit();
        }
    }
    
    // Handle keypress events
    handleTodoKeypress(e) {
        if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            this.saveEdit(id, e.target.value);
        } else if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
            this.cancelEdit();
        }
    }
    
    // Render the todo list
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear the list
        this.todoList.innerHTML = '';
        
        // Show empty state if no todos
        if (filteredTodos.length === 0) {
            const emptyState = this.createEmptyState();
            this.todoList.appendChild(emptyState);
        } else {
            // Render todos
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }
        
        // Update stats
        this.updateStats();
    }
    
    // Create empty state element
    createEmptyState() {
        const li = document.createElement('li');
        li.className = 'empty-state';
        
        const message = this.currentFilter === 'all' ? 
            'No tasks yet. Add one above!' :
            this.currentFilter === 'pending' ?
            'No pending tasks!' :
            'No completed tasks!';
        
        li.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>${message}</p>
        `;
        
        return li;
    }
    
    // Create todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        if (this.editingId === todo.id) {
            li.innerHTML = this.createEditTemplate(todo);
        } else {
            li.innerHTML = this.createTodoTemplate(todo);
        }
        
        return li;
    }
    
    // Create todo template
    createTodoTemplate(todo) {
        return `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" title="${todo.completed ? 'Mark as pending' : 'Mark as completed'}">
                ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }
    
    // Create edit template
    createEditTemplate(todo) {
        return `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}">
                ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            <div class="todo-actions">
                <button class="save-btn" style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="cancel-btn" style="background: #6c757d; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;
    }
    
    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const pending = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalTasks.textContent = total;
        this.pendingTasks.textContent = pending;
        this.completedTasks.textContent = completed;
    }
    
    // Save todos to localStorage
    saveTodosToStorage() {
        try {
            if (this.username) {
                localStorage.setItem(`todos_${this.username}`, JSON.stringify(this.todos));
            }
        } catch (error) {
            console.error('Error saving todos:', error);
            this.showMessage('Error saving data!', 'error');
        }
    }
    
    // Load todos from localStorage
    loadTodosFromStorage() {
        try {
            if (this.username) {
                const stored = localStorage.getItem(`todos_${this.username}`);
                if (stored) {
                    this.todos = JSON.parse(stored);
                } else {
                    this.todos = [];
                }
            }
        } catch (error) {
            console.error('Error loading todos:', error);
            this.todos = [];
        }
    }
    
    // Show message to user
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: #17a2b8;' : ''}
        `;
        
        // Add to body
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add a destroy method to clean up event listeners if needed
    destroy() {
        // Optionally remove event listeners or clean up
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Authentication and User Management
(function() {
    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const container = document.querySelector('.container');
    const userInfo = document.getElementById('user-info');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logoutBtn');

    // Helper: Get/Set users in localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '{}');
    }
    function setUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    // Helper: Get/Set current user
    function getCurrentUser() {
        return localStorage.getItem('currentUser');
    }
    function setCurrentUser(username) {
        if (username) localStorage.setItem('currentUser', username);
        else localStorage.removeItem('currentUser');
    }

    // Show/hide forms
    showRegister.addEventListener('click', e => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    });
    showLogin.addEventListener('click', e => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
    });

    // Registration
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        if (!username || !password) return alert('Please fill all fields.');
        const users = getUsers();
        if (users[username]) return alert('Username already exists.');
        users[username] = { password };
        setUsers(users);
        alert('Registration successful! Please login.');
        registerForm.reset();
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
    });

    // Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const users = getUsers();
        if (!users[username] || users[username].password !== password) {
            alert('Invalid username or password.');
            return;
        }
        setCurrentUser(username);
        showAppForUser(username);
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        setCurrentUser(null);
        showAuth();
    });

    // Show app for logged-in user
    function showAppForUser(username) {
        authSection.style.display = 'none';
        container.style.display = 'block';
        userInfo.style.display = 'flex';
        userGreeting.textContent = `Hello, ${username}!`;
        // Init TodoApp for this user
        if (window.todoAppInstance) window.todoAppInstance.destroy && window.todoAppInstance.destroy();
        window.todoAppInstance = new TodoApp(username);
    }
    // Show auth forms
    function showAuth() {
        authSection.style.display = 'block';
        container.style.display = 'none';
        userInfo.style.display = 'none';
        if (window.todoAppInstance) window.todoAppInstance.destroy && window.todoAppInstance.destroy();
    }
    // On load, check session
    const currentUser = getCurrentUser();
    if (currentUser) {
        showAppForUser(currentUser);
    } else {
        showAuth();
    }
    // Expose for TodoApp
    window.getCurrentUser = getCurrentUser;
})();

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // TodoApp is now initialized by the auth logic
});