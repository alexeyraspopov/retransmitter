import React, {PropTypes} from 'react';
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
				fragments: {}
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

		componentWillMount() {
			this.fetch(this.props.variables);
		},

		componentWillUnmount() {
			// dispose
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				this.fetch(nextProps.variables);
			}
		},

		render() {
			var {fragments, error, status} = this.state;

			switch (status) {
			case 'success':
				return React.createElement(componentEnum.success, assign(Object.create(null), fragments, this.props));
			case 'failure':
				// TODO: add `onRetry`
				return React.createElement(componentEnum.failure, assign(Object.create(null), {error}, this.props));
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

	invariant(!isEnumerableComponent || isReactComponentEnum(target), 'Success, Failure and Pending should be React components');
	invariant(!isEnumerableComponent || hasSuccessPoint(target), 'At least Success component should be specified');

	return isEnumerableComponent ? target : { success: target };
}

function isReactComponentEnum(target) {
	return ['success', 'failure', 'pending']
		.filter(type => target.hasOwnProperty(type))
		.every(type => typeof target[type] === 'function');
}

function hasSuccessPoint(target) {
	return typeof target.success === 'function';
}
