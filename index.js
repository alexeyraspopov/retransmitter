import React, {PropTypes} from 'react';
import assign from 'object-assign';

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

	return React.createClass({
		displayName: `${Component.displayName || Component.name}Container`,

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
			return React.createElement(Component, assign(Object.create(null), this.state.fragments, this.props));
		},
	});
}

function binary(fn) {
	return (a, b) => fn(a, b);
}
