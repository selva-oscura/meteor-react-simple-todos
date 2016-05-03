import React, { Component, PropTypes } from 'react';
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
	renderTasks(){
		return this.props.tasks.map((task) => (
			<Task key={task._id} task={task} />
		));
	}
	render(){
		return (
			<div className="container">
				<header>
					<h1>ToDo List</h1>
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
		tasks: Tasks.find({}).fetch(),
	};
}, App);