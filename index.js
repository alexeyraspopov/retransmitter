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

		componentWillMount() {
			const variables = assign(Object.create(null), initialVariables, this.props.variables);

			const promises = Object.keys(fragments)
				.map(key => fragments[key](variables).then(data => ({[key]: data})));

			Promise.all(promises).then(fetchedFragments => {
				const state = fetchedFragments.reduce(binary(assign), Object.create(null));

				this.setState({fragments: state});
			});
		},

		componentWillUnmount() {
			// dispose
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				// update
			}
		},

		render() {
			return React.createElement(componentEnum.success, assign(Object.create(null), this.state.fragments, this.props));
		},
	});
}

function binary(fn) {
	return (a, b) => fn(a, b);
}

function enumerate(target) {
	const isEnumerableComponent = typeof target === 'object' && isReactComponentEnum(target);

	invariant(!isEnumerableComponent, 'Success, Failure and Pending should be React components');

	return isEnumerableComponent ? target : { success: target };
}

function isReactComponentEnum(target) {
	return ['success', 'failure', 'pending'].every(type => target.hasOwnProperty(type) && target[type].isReactComponent);
}
