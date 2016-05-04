import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';

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
		Tasks.insert({
			text,
			createdAt: new Date(),
		});

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
					<h1>ToDo List</h1>
					<label className="hide-completed">
						<input 
							type="checkbox"
							readOnly
							checked={this.state.hideCompleted}
							onClick={this.toggleHideCompleted.bind(this)}
						/>
						Hide Completed Tasks
					</label>
					<form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
						<input
							type="text"
							ref="textInput"
							placeholder="Next Task....?"
						/>
					</form>
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
};

export default createContainer(() => {
	return {
		tasks: Tasks.find({}, { sort: {createdAt: -1} }).fetch(),
	};
}, App);