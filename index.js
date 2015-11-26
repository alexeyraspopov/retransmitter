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

		updateState(body) {
			invariant(React.isValidElement(body), `The result of ${functionName} is not a React component`);
			this.setState({body});
		},

		update(props) {
			const result = asyncFunction(props);

			invariant(result instanceof Promise, `The function ${functionName} doesn't return Promise. You probably don't need AsyncComponent in this case`);

			result.then(data => this.updateState(data), error => this.updateState(error));
		},

		componentWillMount() {
			this.update(this.props);
		},

		componentWillReceiveProps(nextProps) {
			this.update(nextProps);
		},

		render() {
			return this.state.body;
		}
	});
}
