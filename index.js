import React from 'react';
import invariant from 'invariant';

export default {AsyncComponent};

function AsyncComponent(asyncFunction) {
	const functionName = asyncFunction.displayName || asyncFunction.name;

	return React.createClass({
		displayName: `Transmitter(${functionName})`,

		getInitialState() {
			return {body: React.createElement('noscript')};
		},

		update(props) {
			const result = asyncFunction(props);
			const updateState = body => this.setState({body});

			// TODO: add test
			invariant(result instanceof Promise, `The function ${functionName} doesn't return Promise. You probably don't need AsyncComponent in this case`);

			// TODO: add failure path, and test for it
			result.then(updateState, updateState);
		},

		componentWillMount() {
			this.update(this.props);
		},

		componentWillReceiveProps(nextProps) {
			this.update(nextProps);
		},

		shouldComponentUpdate(nextProps) {
			// TODO: so what?
			return true;
		},

		render() {
			return this.state.body;
		}
	});
}
