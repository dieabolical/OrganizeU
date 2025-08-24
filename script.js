/*

//script.js - functionality for OrganizeU dashboard

purpose: 
- provides all interactive and dynamic behavior for the organizeU app
- listens for user actions - button clicks, text input and form subs
- updates the DOM by creating, deleting and managing list items
- calculates totals for the creds and updates display in real time
- handles pop up form logic for adding mods
- generates and manages calendar view for the current month 

main features: 
1. modules & courses: 
    - add new modules through a popup 
    - delete modules

2. to do list: 
    - add and remove tasks 
3. credit checker: 
    - add mod credits
    - calculate and display total creds
    - allow credit removal 
4. assignment deadlines
    - add assignments with name and date
    - delete assignments
5. calendar
    - display days of the current month
    - show current month label
*/

// --------------------------------------------------------------------------------- //

//generic helper to create a list item with a delete btm
function createListItem(text, container, saveCallback) {
    const item = document.createElement('div')
    item.classList.add(container.dataset.itemClass || 'item')

    const span = document.createElement('span')
    span.textContent = text

    //logic for the dlt btn
    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'x'
    deleteBtn.classList.add('delete-btn')
    deleteBtn.addEventListener('click', () => {
        container.removeChild(item)
        if (saveCallback) saveCallback()
    })

    item.appendChild(span)
    item.appendChild(deleteBtn)
    container.appendChild(item)
    return item
}

//helper so user can press enter instead of actively clicking the button
function enableEnterKey(input, button) {
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') button.click()
    })
}

// MODULES AND COURSES 
const addBtn = document.querySelector('.add-btn')
const popup = document.getElementById('module-popup')
const closePopup = document.getElementById('close-popup')
const saveModule = document.getElementById('save-module')
const moduleInput = document.getElementById('module-input')
const modulesList = document.getElementById('modules-list')

//load the saved data and render ui once the page has loaded 
document.addEventListener('DOMContentLoaded', () => {
    loadModules()
    renderCalendar()
    loadTodos()
    loadCredits()
    loadAssignments()
})

//show and hide the popup 
addBtn.addEventListener('click', () => { popup.classList.remove('hidden'); moduleInput.focus() })
closePopup.addEventListener('click', () => { popup.classList.add('hidden'); moduleInput.value = '' })

//save the module 
saveModule.addEventListener('click', () => {
    const name = moduleInput.value.trim()
    if (name) {
        addModule(name)
        saveModules()
        moduleInput.value = ''
        popup.classList.add('hidden')
    }
})
enableEnterKey(moduleInput, saveModule)

//add module function
function addModule(name) {
    createListItem(name, modulesList, saveModules)
}

//local storage 
function saveModules() {
    const modules = Array.from(modulesList.querySelectorAll('span')).map(s => s.textContent)
    localStorage.setItem('modules', JSON.stringify(modules))
}
function loadModules() {
    const stored = JSON.parse(localStorage.getItem('modules')) || []
    stored.forEach(addModule)
}


//CALENDAR
function renderCalendar() {
    const calendar = document.getElementById('calendar')
    calendar.innerHTML = ''

    const now = new Date()
    const month = now.getMonth(), year = now.getFullYear(), today = now.getDate()

    //label for month and year 
    const monthNames = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
    document.getElementById('month-label').textContent = `${monthNames[month]} ${year}`

    //days of the week header row
    const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    daysOfWeek.forEach(d => {
        const header = document.createElement('div')
        header.classList.add('calendar-day','calendar-header')
        header.textContent = d
        calendar.appendChild(header)
    })

    //figure out the first day offset + number of days
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    //add empty slots for alignment
    for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement('div'))
    
    //render each day cell 
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div')
        cell.classList.add('calendar-day')
        cell.textContent = day
        if (day === today) cell.classList.add('today')
        calendar.appendChild(cell)
    }
}

//TODO LIST
const todoInput = document.getElementById('todo-input')
const addToDoBtn = document.getElementById('add-todo-btn')
const todoList = document.getElementById('todo-list')

//add a new todo task 
addToDoBtn.addEventListener('click', () => {
    const task = todoInput.value.trim()
    if (task) {
        addToDo(task)
        saveTodos()
        todoInput.value = ''
    }
})
enableEnterKey(todoInput, addToDoBtn)

function addToDo(task) {
    const item = createListItem(task, todoList, saveTodos)

    //toggle completed on click 
    item.querySelector('span').addEventListener('click', () => {
        item.classList.toggle('completed')
        saveTodos()
    })
}

//persist todos with completed state 
function saveTodos() {
    const tasks = Array.from(todoList.querySelectorAll('div')).map(item => ({
        text: item.querySelector('span').textContent,
        completed: item.classList.contains('completed')
    }))
    localStorage.setItem('todos', JSON.stringify(tasks))
}

//load tools from storage 
function loadTodos() {
    const stored = JSON.parse(localStorage.getItem('todos')) || []
    stored.forEach(todo => {
        const item = addToDo(todo.text)
        if (todo.completed) item.classList.add('completed')
    })
}

//CREDIT CHECKER 
const creditInput = document.getElementById('credit-input')
const addCreditBtn = document.getElementById('add-credit-btn')
const creditList = document.getElementById('credit-list')
const totalCreditsEl = document.getElementById('total-credits')

//add the credit item 
addCreditBtn.addEventListener('click', () => {
    const val = parseInt(creditInput.value)
    if (!isNaN(val) && val > 0) {
        addCredit(val)
        saveCredits()
        creditInput.value = ''
    }
})
enableEnterKey(creditInput, addCreditBtn)

function addCredit(val) {
    const item = createListItem(`${val} credits`, creditList, saveCredits)
    updateTotalCredits()
}

//re calculate total credits
function updateTotalCredits() {
    const total = Array.from(creditList.querySelectorAll('span')).reduce((sum, s) => sum + parseInt(s.textContent), 0)
    totalCreditsEl.textContent = `total credits: ${total}`
}

//persist total credits
function saveCredits() {
    const credits = Array.from(creditList.querySelectorAll('span')).map(s => parseInt(s.textContent))
    localStorage.setItem('credits', JSON.stringify(credits))
}

//load saved credits 
function loadCredits() {
    const stored = JSON.parse(localStorage.getItem('credits')) || []
    stored.forEach(addCredit)
}

//ASSIGNMENT DEADLINES
const assignmentName = document.getElementById('assignment-name')
const assignmentDate = document.getElementById('assignment-date')
const addAssignmentBtn = document.getElementById('add-assignment-btn')
const assignmentList = document.getElementById('assignment-list')

//add assignment with name and date 
addAssignmentBtn.addEventListener('click', () => {
    const name = assignmentName.value.trim()
    const date = assignmentDate.value
    if (name && date) {
        addAssignment(name, date)
        saveAssignments()
        assignmentName.value = ''
        assignmentDate.value = ''
    }
})
enableEnterKey(assignmentName, addAssignmentBtn)
enableEnterKey(assignmentDate, addAssignmentBtn)

//create assignment item 
function addAssignment(name, date) {
    createListItem(`${name} - ${date}`, assignmentList, saveAssignments)
}

//persist assignments 
function saveAssignments() {
    const assignments = Array.from(assignmentList.querySelectorAll('span')).map(s => {
        const [name, date] = s.textContent.split(' - ')
        return { name, date }
    })
    localStorage.setItem('assignments', JSON.stringify(assignments))
}

//load all the assignment 
function loadAssignments() {
    const stored = JSON.parse(localStorage.getItem('assignments')) || []
    stored.forEach(a => addAssignment(a.name, a.date))
}

// --------------------------------------------------------------------------------- //
