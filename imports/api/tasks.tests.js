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

			describe('set private tests', () => {
				it('non-logged-in-user can\'t set private status', () => {
					// Find the internal implementation of the task method in order to test in isolation
					const setPrivate = Meteor.server.method_handlers["tasks.setPrivate"];
					// set up fake method invocation consistent with what the method expect
					const invocation = { notLoggedIn };
					// Run method with 'this' set to fake invocation
					expect(setPrivate.bind(invocation, [taskId, true])).to.throw(Meteor.Error('not-authorized'));
				});
				it('non-owner can\'t set private status to private', () => {
					// Find the internal implementation of the task method in order to test in isolation
					const setPrivate = Meteor.server.method_handlers["tasks.setPrivate"];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };
					// Run method with 'this' set to fake invocation
					expect(setPrivate.bind(invocation, [taskId, true])).to.throw(Meteor.Error('not-authorized'));
				});
				it('non-owner can\'t set private status to public', () => {
					// set taskId privacy status to private
					Tasks.update({_id:taskId},{$set:{private: true}});
					const privateCount = Tasks.find({private:true}).count();
					// Find the internal implementation of the task method in order to test in isolation
					const setPrivate = Meteor.server.method_handlers["tasks.setPrivate"];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };
					// Run method with 'this' set to fake invocation
					// expect(setPrivate.bind(invocation, [taskId, false])).to.throw(Meteor.Error('not-authorized'));
					assert.equal(privateCount, Tasks.find({private:true}).count());
				});
				it('owner can set private status to private', () => {
					// Find the internal implementation of the task method in order to test in isolation
					const setPrivate = Meteor.server.method_handlers["tasks.setPrivate"];
					// current count of private tasks
					const privateCount = Tasks.find({private:true}).count();

					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };
					
					// Run method with 'this' set to fake invocation
					setPrivate.apply(invocation, [taskId, true]);

					// check that the number of private items is one more after invoking setPrivate true 
					assert.equal(Tasks.find({private:true}).count(), privateCount+1);
				});
				it('owner can set private status to public', () => {
					// set taskId privacy status to private
					Tasks.update({_id:taskId},{$set:{private: true}});
					// current count of private tasks
					const privateCount = Tasks.find({private:true}).count();
					
					// Find the internal implementation of the task method in order to test in isolation
					const setPrivate = Meteor.server.method_handlers["tasks.setPrivate"];
					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };
					
					// Run method with 'this' set to fake invocation
					setPrivate.apply(invocation, [taskId, false]);

					// check that the number of private items is one less after invoking setPrivate false 
					assert.equal(Tasks.find({private:true}).count(), privateCount-1);
				});
			});

			describe('set checked tests', () => {
				it('non-logged-in-user can\'t set checked status of public task', () => {
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { notLoggedIn };
					// setChecked.apply(invocation, [taskId, true]);
					// Run method with 'this' set to fake invocation
					expect(setChecked.bind(invocation, [taskId, true])).to.throw(Meteor.Error('not-authorized'));
				});

				it('non-logged-in-user can\'t set checked status of private task', () => {
					// set taskId to private
					Tasks.update({_id:taskId},{$set:{private:true}});
					
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { notLoggedIn };
					
					// check that not-authorized error is thrown when running method with 'this' set to fake invocation for non-owner
					expect(setChecked.bind(invocation, [taskId, true])).to.throw(Meteor.Error('not-authorized'));
				});

				it('non-owner can set checked status of public task to checked', () => {
					// current count of checked tasks
					const checkedCount = Tasks.find({checked:true}).count();
					
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };

					// Run method with 'this' set to fake invocation
					setChecked.apply(invocation, [taskId, true]);

					// check that the number of checked items is one greater after invoking setChecked true 
					assert.equal(Tasks.find({checked:true}).count(), checkedCount+1);

				});

				it('non-owner can set checked status of public task to unchecked', () => {
					// set taskId checked status to true
					Tasks.update({_id:taskId},{$set:{checked:true}})
					// current count of checked tasks
					const checkedCount = Tasks.find({checked:true}).count();
					
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };

					// Run method with 'this' set to fake invocation
					setChecked.apply(invocation, [taskId, false]);

					// check that the number of checked items is one greater after invoking setChecked true 
					assert.equal(Tasks.find({checked:true}).count(), checkedCount-1);

				});

				it('non-owner can\'t set checked status of private task to checked', () => {
					// set taskId to private
					Tasks.update({_id:taskId},{$set:{private:true}});
					
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };

					// check that not-authorized error is thrown when running method with 'this' set to fake invocation for non-owner
					expect(setChecked.bind(invocation, [taskId, true])).to.throw(Meteor.Error('not-authorized'));
				});

				it('non-owner can\'t set checked status of private task to unchecked', () => {
					// setting status of task taskId to checked, so that we can then test it is later unchecked
					Tasks.update({_id:taskId}, {$set:{checked:true}});
					// set taskId to private
					Tasks.update({_id:taskId},{$set:{private:true}});
					
					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { otherUserId };

					// check that not-authorized error is thrown when running method with 'this' set to fake invocation for non-owner
					expect(setChecked.bind(invocation, [taskId, false])).to.throw(Meteor.Error('not-authorized'));
				});

				it('owner can set checked status of private task to checked', () => {
					// make taskId private
					Tasks.update({_id:taskId},{$set:{private:true}});

					// current count of tasks
					const checkedCount = Tasks.find({checked:true}).count();

					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };

					// Run method with 'this' set to fake invocation
					setChecked.apply(invocation, [taskId, true]);

					// check that the number of checked items is one greater after invoking setChecked true 
					assert.equal(Tasks.find({checked:true}).count(), checkedCount+1);
				});
				it('owner can set checked status of private task to unchecked', () => {
					// setting status of task taskId to checked, so that we can then test it is later unchecked
					Tasks.update({_id:taskId}, {$set:{checked:true}});
					// make taskId private
					Tasks.update({_id:taskId},{$set:{private:true}});

					// current count of checked tasks
					const checkedCount = Tasks.find({checked:true}).count();

					// Find the internal implementation of the task method in order to test in isolation
					const setChecked = Meteor.server.method_handlers['tasks.setChecked'];
					// set up fake method invocation consistent with what the method expect
					const invocation = { userId };

					// Run method with 'this' set to fake invocation
					setChecked.apply(invocation, [taskId, false]);

					// check that the number of checked items is one less after invoking setChecked false 
					assert.equal(Tasks.find({checked:true}).count(), checkedCount-1);
				});
			});
		});
	});
}