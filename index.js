import React, {PropTypes} from 'react';
import assign from 'object-assign';

export default function Container(Component, options) {
	// Component :: ReactClass
	// options :: { initialVariables, fragments, shouldContainerUpdate }
	// fragments can return Promise, Observer, Subscription
	// Promise :: { then }
	// Observer :: { subscribe -> unsubscribe }
	// Subscription :: { getState, subscribe -> { dispose } }
	const {
		fragments = {},
		shouldContainerUpdate = () => true,
		initialVariables = {}
	} = options;

	const componentPropTypes = Component.propTypes || {};

	return React.createClass({
		displayName: `${Component.displayName || Component.name}Container`,

		propTypes: {
			variables: PropTypes.object,
			...componentPropTypes
		},

		componentWillMount() {
			const variables = assign({}, initialVariables, this.props.variables);

			const promises = Object.keys(fragments)
				.map(key => fragments[key](variables).then(data => ({[key]: data})));

			Promise.all(promises).then(fetchedFragments => {
				const state = fetchedFragments.reduce((acc, fetchedFragment) =>
					assign(acc, fetchedFragment)
				, {});

				this.setState(state);
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
			const {children} = this.props;

			return <Component children={children} />;
		}
	});
}
