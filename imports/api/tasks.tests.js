/* eslint-env-mocha */

// run via command line: 
// meteor test --driver-package practicalmeteor:mocha

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert, expect } from 'meteor/practicalmeteor:chai';
import { Tasks } from './tasks.js';


if(Meteor.isServer){
	describe('Tasks', () => {
		describe('methods', () => {
			const userId = Random.id();
			const otherUserId = Random.id();
			const notLoggedIn = null;
			let taskId;
			beforeEach(() => {
				Tasks.remove({});
				Meteor.users.remove({})
				taskId = Tasks.insert({
					text: 'test task',
					createdAt: new Date(),
					owner: userId,
					username: 'blahblah'
				});
			});
			describe('insertion tests', () => {
				it('can\'t insert task for non-logged in user', () => {
					const failText = 'purposeful fail';
					const insertTask = Meteor.server.method_handlers['tasks.insert'];
					const invocation = { notLoggedIn };
					expect(insertTask.bind(invocation, failText)).to.throw(Meteor.Error('not-authorized'));
				});
				it('can insert task for logged-in user', () =>{
					const testText = 'test task';
					const taskCount = Tasks.find().count();
					const insertTask = Meteor.server.method_handlers['tasks.insert'];
					const invocation = { userId };
					insertTask.apply(invocation, [testText]);
					assert.equal(Tasks.find().count(), taskCount+1);
				});
			});

			describe('deletion tests', () => {
				it('can\'t delete other user\'s task (throws not-authorized error)', () => {
					// Find the internal implementation of the task method in order to test in isolation
					const deleteTask = Meteor.server.method_handlers['tasks.remove'];

					// set up fake method invocation consistent with non-owner id
					const invocation = { otherUserId };

					// Run method to test if error
					expect(deleteTask.bind(invocation, taskId)).to.throw(Meteor.Error('not-authorized'));

					// verify method does what expected
					assert.equal(Tasks.find().count(), 1);

				});
				it('can delete owned task', () => {
					// current count of tasks
					const taskCount = Tasks.find().count();
					// Find the internal implementation of the task method in order to test in isolation
					const deleteTask = Meteor.server.method_handlers['tasks.remove'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };

					// Run method with 'this' set to fake invocation
					deleteTask.apply(invocation, [taskId]);

					// verify method does what expected
					assert.equal(Tasks.find().count(), taskCount-1);
				});
			});
			describe('set checked tests', () => {
				it('can set checked status to checked', () => {
					// current count of tasks
					const checkedCount = Tasks.find({checked:true}).count();
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };

					// Run method with 'this' set to fake invocation
					setChecked.apply(invocation, [taskId, true]);
					assert.equal(Tasks.find({checked:true}).count(), checkedCount+1);
				});
			});
		});
	});
}