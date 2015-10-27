import React, {PropTypes} from 'react';
import {Observable} from 'rx';
import assign from 'object-assign';
import invariant from 'invariant';

export default function Container(Component, options) {
	// fragments can return Promise, Observer, Subscription
	// Component :: ReactClass | { pending, success, failure }
	// Promise :: { then }
	// Observer :: { subscribe -> unsubscribe }
	// Subscription :: { getState, subscribe -> { dispose } }
	const {
		fragments = {},
		shouldContainerUpdate = () => true,
		initialVariables = {},
	} = options;

	const componentEnum = enumerate(Component);

	return React.createClass({
		displayName: `${componentEnum.success.displayName || componentEnum.success.name}Container`,

		propTypes: {
			variables: PropTypes.object,
		},

		getInitialState() {
			return {
				status: 'pending',
				fragments: {},
				error: null,
			};
		},

		fetch(newVariables) {
			const variables = assign(Object.create(null), initialVariables, newVariables);

			const promises = Object.keys(fragments)
				.map(key => fragments[key](variables).then(data => ({[key]: data})));

			Promise.all(promises).then(
				results => this.setState({
					status: 'success',
					fragments: results.reduce(binary(assign), Object.create(null)),
				}),
				error => this.setState({
					status: 'failure',
					error,
				})
			);
		},

		refetch() {
			this.setState({status: 'pending'});
			this.fetch(this.props.variables);
		},

		componentWillMount() {
			this.disposables = [];
			this.fetch(this.props.variables);
		},

		componentWillUnmount() {
			this.disposables.forEach(fn => fn());
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				this.setState({status: 'pending'});
				this.fetch(nextProps.variables);
			}
		},

		render() {
			const {fragments, error, status} = this.state;
			const onRetry = () => this.refetch();

			switch (status) {
			case 'success':
				return React.createElement(componentEnum.success, assign(fragments, this.props));
			case 'failure':
				return React.createElement(componentEnum.failure, assign({error, onRetry}, this.props));
			case 'pending':
				// falls through
			default:
				return React.createElement(componentEnum.pending, this.props);
			}
		},
	});
}

function binary(fn) {
	return (a, b) => fn(a, b);
}

function enumerate(target) {
	const isEnumerableComponent = typeof target === 'object';

	if (isEnumerableComponent) {
		invariant(isReactComponentEnum(target), 'Success, Failure and Pending should be React components');
		invariant(hasSuccessPoint(target), 'At least Success component should be specified');
	}

	return isEnumerableComponent ? target : {success: target};
}

function isReactComponentEnum(target) {
	return ['success', 'failure', 'pending']
		.filter(type => target.hasOwnProperty(type))
		.every(type => typeof target[type] === 'function');
}

function hasSuccessPoint(target) {
	return typeof target.success === 'function';
}
