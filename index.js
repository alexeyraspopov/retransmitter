// TODO: add spinner that will be shown after 100ms (RAIL)
import React from 'react';
import invariant from 'invariant';

export function AsyncComponent(asyncFunction) {
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

		observe(props) {
			const result = asyncFunction(props);

			invariant(result instanceof Promise, `The function ${functionName} doesn't return Promise. You probably don't need AsyncComponent in this case`);

			result.then(data => this.updateState(data), error => this.updateState(error));
		},

		componentWillMount() {
			this.observe(this.props);
		},

		componentWillReceiveProps(nextProps) {
			this.observe(nextProps);
		},

		render() {
			return this.state.body;
		}
	});
}

export class Container extends React.Component {
	constructor(props) {
		super(props);
		this.state = null;
	}

	componentWillMount() {
		invariant(typeof this.observe === 'function', 'You should implement `observe` method for getting Transmitter.Container power');
	}

	componentWillUnmount() {
		// TODO: call dispose method
	}

	componentWillReceiveProps(nextProps) {
		// TODO: observe data again
	}

	render() {
		// TODO: choose correct render method
	}
}

export default {AsyncComponent, Container};
