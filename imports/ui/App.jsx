import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

// App component (represents the whole app)

// /* deprecated after creating a tasks collection rather than relying on static data */
// export default class App extends Component {
// 	getTasks(){
// 		return [
// 			{ _id: 1, text: 'This is task 1'},
// 			{ _id: 2, text: 'This is task 2'},
// 			{ _id: 3, text: 'This is task 3'},
// 		];
// 	}
// 	renderTasks(){
// 		return this.getTasks().map((task) => (
// 			<Task key={task._id} task={task} />
// 		));
// 	}
// 	render(){
// 		return (
// 			<div className="container">
// 				<header>
// 					<h1>ToDo List</h1>
// 				</header>
// 				<ul>
// 					{this.renderTasks()}
// 				</ul>
// 			</div>
// 		);
// 	}
// }

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			hideCompleted: false,
		};
	}
	handleSubmit(event){
		event.preventDefault();

		// Find the text filed via the React ref
		const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		// deprecated after adding task.insert method in imports/api/tasks.js
		// Tasks.insert({
		// 	text,
		// 	owner: Meteor.userId(), // id of current user
		// 	username: Meteor.user().username,  // username of current user
		// 	createdAt: new Date(), //current time
		// });

		// call tasks.insert method in imports/api/tasks.js
		Meteor.call('tasks.insert', text);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value='';
	}

	toggleHideCompleted(){
		this.setState({
			hideCompleted: !this.state.hideCompleted,
		});
	}

	renderTasks(){
		// deprecated after switch to filteredTasks to allow hiding of completed tasks
		// return this.props.tasks.map((task) => (
		// 	<Task key={task._id} task={task} />
		// ));
		let filteredTasks = this.props.tasks;
		if(this.state.hideCompleted){
			filteredTasks = filteredTasks.filter(task => !task.checked);
		}
		return filteredTasks.map((task) => (
			<Task key={task._id} task={task} />
		));
	}
	render(){
		return (
			<div className="container">
				<header>
					<h1>ToDo List ({this.props.incompleteCount})</h1>
					
					<label className="hide-completed">
						<input 
							type="checkbox"
							readOnly
							checked={this.state.hideCompleted}
							onClick={this.toggleHideCompleted.bind(this)}
						/>
						Hide Completed Tasks
					</label>
					
					<AccountsUIWrapper />

					{ this.props.currentUser ?
						<form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
							<input
								type="text"
								ref="textInput"
								placeholder="Next Task....?"
							/>
						</form> : ''
					}
				</header>
				<ul>
					{this.renderTasks()}
				</ul>
			</div>
		);
	}
}

App.PropTypes = {
	tasks: PropTypes.array.isRequired,
	incompleteCount: PropTypes.number.isRequired,
	currentUser: PropTypes.object,
};

export default createContainer(() => {
	Meteor.subscribe('tasks');
	return {
		tasks: Tasks.find({}, { sort: {createdAt: -1} }).fetch(),
		incompleteCount: Tasks.find({checked: { $ne: true } }).count(),
		currentUser: Meteor.user(),
	};
}, App);