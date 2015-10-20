import React from 'react';

export default function Container(Component, options) {
	// Component :: ReactClass
	// options :: { initialVariables, fragments, shouldContainerUpdate }
	// fragments can return Promise, Observer, Subscription
	// Promise :: { then }
	// Observer :: { subscribe -> unsubscribe }
	// Subscription :: { subscribe -> { dispose } }
	return React.createClass({
		displayName: `${Component.displayName || Component.name}Container`,

		componentWillMount() {
			// subscribe
		},

		componentWillUnmount() {
			// dispose
		},

		componentWillReceiveProps() {
			// update
		},

		render() {
			const {children} = this.props;

			return <Component children={children} />;
		}
	});
}
