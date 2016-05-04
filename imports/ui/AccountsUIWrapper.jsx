import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaxe } from 'meteor/blaze';

export default class AccountsUIWrapper extends Component {
	componentDidMount(){
		// Meteor's Blaze used to render login buttons
		this.view = Blaze.render(Template.loginButtons, 
			ReactDOM.findDOMNode(this.refs.container));
	}
	componentWillUnmount(){
		// CLean up Blaze view
		Blaze.remove(this.view);
	}
	render(){
		// render placeholder container that will be filled in
		return <span ref="container" />;
	}
}