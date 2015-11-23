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

			// TODO: add test
			invariant(result instanceof Promise, `The function ${functionName} doesn't return Promise. You probably don't need AsyncComponent in this case`);

			// TODO: add failure path
			result.then(body => this.setState({body}));
		},

		componentWillMount() {
			this.update(this.props);
		},

		// TODO: add shouldComponentUpdate
		componentWillReceiveProps(nextProps) {
			this.update(nextProps);
		},

		render() {
			return this.state.body;
		}
	});
}
