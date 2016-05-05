import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';

import { Tasks } from '../api/tasks.js';

// Task component (represents single ToDo item)
export default class Task extends Component {
	toggleChecked() {
		// Set the checked property to the opposite of current value

		// deprecated after tasks.update method created in imports/api/tasks.js
		// Tasks.update(this.props.task._id, {
		// 	$set: { checked: !this.props.task.checked },
		// });

	Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
	}

	deleteThisTask(){
		// deprecated after tasks.update method created in imports/api/tasks.js
		// Tasks.remove(this.props.task._id);
		Meteor.call('tasks.remove', this.props.task._id);
	}
	render(){
		// Give tasks a different className when checked off
		const taskClassName = this.props.task.checked ? 'checked' : '';
		return (
			<li className={taskClassName}>
				<button className="delete" onClick={this.deleteThisTask.bind(this)}>
					&times;
				</button>
				<input 
					type="checkbox"
					readOnly
					checked={this.props.task.checked}
					onClick={this.toggleChecked.bind(this)}
				/>
				<span className="text">
					<strong>{this.props.task.username}: </strong>
					{this.props.task.text}
				</span>
			</li>
		);
	}
}

Task.propTypes = {
	// This component gets the task to display, through React prop
	// propTypes & isRequired used to indicate it is required
	task: PropTypes.object.isRequired,
};