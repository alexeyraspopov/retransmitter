import React, {PropTypes} from 'react';
import invariant from 'invariant';

export default function AsyncComponent(asyncFunction) {
	const functionName = asyncFunction.displayName || asyncFunction.name;

	return React.createClass({
		displayName: `Transmitter(${functionName})`,

		propTypes: {
			onFetch: PropTypes.func,
		},

		getInitialState() {
			return {body: React.createElement('noscript')};
		},

		getDefaultProps() {
			return {onFetch: () => void 0};
		},

		updateState(body, status) {
			invariant(React.isValidElement(body), `The result of ${functionName} is not a React element`);

			this.setState({body});
			this.props.onFetch(status);
		},

		observe(props) {
			const result = asyncFunction(props);
			const onSuccess = data => this.updateState(data, 'success');
			const onFailure = error => this.updateState(error, 'failure');

			invariant(result instanceof Promise, `The function ${functionName} doesn't return Promise. You probably don't need AsyncComponent in this case`);

			result.then(onSuccess, onFailure);
		},

		componentWillMount() {
			this.observe(this.props);
		},

		componentWillReceiveProps(nextProps) {
			this.observe(nextProps);
		},

		render() {
			return this.state.body;
		},
	});
}
