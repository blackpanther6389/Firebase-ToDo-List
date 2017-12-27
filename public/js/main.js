// Firebase namespaces
let auth = firebase.auth();

// Main containers
let portal = document.getElementById('portal');
let dashboard = document.getElementById('dashboard');

// Individual elements
let loginButton = document.getElementById('loginButton');
let signupButton = document.getElementById('signupButton');
let userName = document.getElementById('userName');
let password = document.getElementById('password');
let logoutButton = document.getElementById('logoutButton');
let displayName = document.getElementById('displayName');
let taskField = document.getElementById('taskField');
let submitTask = document.getElementById('submitTask');
let taskContainer = document.getElementById('taskContainer');

userName.addEventListener('keydown', e => {
	if (e.key =='Enter')
	{
		// Set Persistence of state for keeping users logged in
		const promise = auth.signInWithEmailAndPassword(userName.value, password.value);
		promise.catch(e => alert('Login failed!'));
	}
});

password.addEventListener('keydown', e => {
	if (e.key =='Enter')
	{
		// Set Persistence of state for keeping users logged in
		const promise = auth.signInWithEmailAndPassword(userName.value, password.value);
		promise.catch(e => alert('Login failed!'));
	}
});
loginButton.addEventListener('click', e => {
	// Set Persistence of state for keeping users logged in
	const promise = auth.signInWithEmailAndPassword(userName.value, password.value);
	promise.catch(e => alert('Login failed!'));
});

signupButton.addEventListener('click', e => {
	const promise = auth.createUserWithEmailAndPassword(userName.value, password.value);
	promise.then(user => {
		createNewUser(user.uid, user.email);
		alert('Signup Successful!');
	});
	promise.catch(e => console.log('Signup failed!'));
});

logoutButton.addEventListener('click', e => {
	auth.signOut();
});

taskField.addEventListener('keydown', e => {
	if (e.key == 'Enter')
	{
		if (taskField.value == '')
		{
			alert('Enter a task!');
		}
		else
		{
			database = firebase.database();

			taskRef = database.ref('Users/' + auth.currentUser.uid + '/tasks');

			let dataObject = {
				date: (new Date()).toJSON(),
				taskDesc: taskField.value
			};

			taskRef.push(dataObject).then(function() {
				console.log('Task added successfully!');
				taskField.value = '';
			});
		}
	}
});
submitTask.addEventListener('click', e => {
	if (taskField.value == '')
	{
		alert('Enter a task!');
	}
	else
	{
		database = firebase.database();

		taskRef = database.ref('Users/' + auth.currentUser.uid + '/tasks');

		let dataObject = {
			date: (new Date()).toJSON(),
			taskDesc: taskField.value
		};

		taskRef.push(dataObject).then(function() {
			console.log('Task added successfully!');
			taskField.value = '';
		});
	}
});

auth.onAuthStateChanged(user => {
	if(user)
	{
		submitTask.value = '';
		userName.value = '';
		password.value = '';
		portal.setAttribute('hidden', 'true');
		dashboard.removeAttribute('hidden');
		portal.classList.add("hidden");
		dashboard.classList.remove("hidden");
		displayName.innerHTML = user.email;

		// Create listener to update info
		let database = firebase.database();
		let userTasksRef = database.ref('Users/' + user.uid + '/tasks');

		// Remove nodes of previous user
		while (taskContainer.firstChild)
		{
			taskContainer.removeChild(taskContainer.firstChild);
		}

		userTasksRef.limitToLast(10).on("child_added", function(data){
			console.log(data.key)
			createTaskElement(data.key, data.val().taskDesc);
		});
	}
	else
	{
		submitTask.value = '';
		userName.value = '';
		password.value = '';
		portal.removeAttribute('hidden');
		dashboard.setAttribute('hidden', 'true');
		portal.classList.remove("hidden");
		dashboard.classList.add("hidden");
		displayName.innerHTML = '';
	}
});
/***********************************************************************************/
/************************************************************************************
*
*
*
************************************************************************************/
function createTaskElement(taskKey, desc)
{
	console.log('In createTaskElement function');

	// Get Reference to Task Container
	let taskContainer = document.getElementById('taskContainer');

	// Create elements of a task item
	let task = document.createElement('div');
	let taskDesc = document.createElement('p');
	let deleteButton = document.createElement('button');
	let taskText = document.createTextNode(desc);
	let buttonText = document.createTextNode('Delete Task');

	// Set attributes of task item
	// p is inline with button
	task.classList.add("task");
	taskDesc.style.display = 'inline';
	task.id = taskKey;

	// Set onclick listener for delete button
	deleteButton.addEventListener('click', event => {
		console.log('Delete Button');

		let parentId = event.target.parentNode.id;

		let targetElement = document.getElementById(parentId);

		let database = firebase.database();

		let taskRef = database.ref('Users/' + auth.currentUser.uid + '/tasks/' + parentId);

		taskRef.remove().then(taskContainer.removeChild(targetElement));
	});

	// Start appending starting with the text stuff
	taskDesc.appendChild(taskText);
	task.appendChild(taskDesc);
	deleteButton.appendChild(buttonText);
	task.appendChild(deleteButton);
	taskContainer.appendChild(task);
}

/************************************************************************************
*
*
*
************************************************************************************/
/************************************************************************************
*
*
*
************************************************************************************/
function userDoesExist(uid)
{
	let database = firebase.database();

	let userRef = database.ref('Users/' + uid);

	if(userRef == null)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function createNewUser(uid, name)
{
	let database = firebase.database();

	let userRef = database.ref('Users/' + uid);

	console.log(userRef);
	let dataObject = {
		name: name
	};

	userRef.set(dataObject, function(message){
		console.log('Complete!');
	});
}
