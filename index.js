import React from 'react';

export default {AsyncComponent};

function AsyncComponent(asyncFunction) {
	return React.createClass({
		displayName: `Transmitter(${asyncFunction.displayName || asyncFunction.name})`,

		getInitialState() {
			return {body: <noscript />};
		},

		update(props) {
			const result = asyncFunction(props);

			// TODO: add failure path
			Promise.resolve(result).then(body => this.setState({body}))
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
