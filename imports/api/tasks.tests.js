/* eslint-env-mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';
import { Tasks } from './tasks.js';


if(Meteor.isServer){
	describe('Tasks', () => {
		describe('methods', () => {
			const userId = Random.id();
			let taskId;
			beforeEach(() => {
				Tasks.remove({});
				taskId = Tasks.insert({
					text: 'test task',
					createdAt: new Date(),
					owner: userId,
					username: 'blahblah'
				});
			});
			it('can delete owned task', () => {
				// Find the internal implementation of the task method in order to test in isolation
				const deleteTask = Meteor.server.method_handlers['tasks.remove'];

				// set up fake method invocation consistent with what the method expect
				const invocation = { userId };

				// Run method with 'this' set to fake invocation
				deleteTask.apply(invocation, [taskId]);

				// verify method does what expected
				assert.equal(Tasks.find().count(), 0);
			})
		})
	});
}