import React, { Component, PropTypes } from 'react';

// Task component (represents single ToDo item)
export default class Task extends Component {
	render(){
		return (
			<li>{this.props.task.text}</li>
		);
	}
}

Task.propTypes = {
	// This component gets the task to display, through React prop
	// propTypes & isRequired used to indicate it is required
	task: PropTypes.object.isRequired,
};