import React, {PropTypes} from 'react';
import {Observable} from 'rx';
import assign from 'object-assign';
import invariant from 'invariant';

export default {create: Container, fromStore};

function Container(Component, options) {
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

		getInitialState() {
			return {
				status: 'pending',
				fragments: {},
				error: null,
			};
		},

		fetchFragment(fragment, variables, name) {
			const fragmentContainer = fragment(variables)

			if (typeof fragmentContainer.then === 'function') {
				return Observable.fromPromise(fragmentContainer)
					.map(data => ({[name]: data}));
			}
			// assume that fragmentContainer is Observable
			return fragmentContainer.map(data => ({[name]: data}));
		},

		fetch(newVariables) {
			const variables = assign({}, initialVariables, newVariables);

			const streams = Object.keys(fragments)
				.map(key => this.fetchFragment(fragments[key], variables, key));

			Observable.combineLatest(streams)
				.subscribe(
					results => this.setState({
						status: 'success',
						fragments: results.reduce(binary(assign), {}),
					}),
					error => this.setState({
						status: 'failure',
						error,
					})
				);
		},

		refetch() {
			this.setState({status: 'pending', error: null});
			this.fetch(this.props.variables);
		},

		componentWillMount() {
			this.disposables = [];
			this.fetch(this.props.variables);
		},

		componentWillUnmount() {
			this.disposables.forEach(fn => fn());
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				this.setState({status: 'pending', error: null});
				this.fetch(nextProps.variables);
			}
		},

		render() {
			const {fragments, error, status} = this.state;
			const onRetry = () => this.refetch();

			switch (status) {
			case 'success':
				return React.createElement(componentEnum.success, assign(fragments, this.props));
			case 'failure':
				return React.createElement(componentEnum.failure, assign({error, onRetry}, this.props));
			case 'pending':
				// falls through
			default:
				return React.createElement(componentEnum.pending, this.props);
			}
		},
	});
}

function binary(fn) {
	return (a, b) => fn(a, b);
}

function EmptyComponent() {
	return null;
}

function enumerate(target) {
	const isEnumerableComponent = typeof target === 'object';

	if (isEnumerableComponent) {
		invariant(isReactComponentEnum(target), 'Success, Failure and Pending should be React components');
		invariant(hasSuccessPoint(target), 'Success component should be specified');
	}

	return isEnumerableComponent ? target : {success: target, pending: EmptyComponent, failure: EmptyComponent};
}

function isReactComponentEnum(target) {
	return ['success', 'failure', 'pending']
		.filter(type => target.hasOwnProperty(type))
		.every(type => typeof target[type] === 'function');
}

function hasSuccessPoint(target) {
	return typeof target.success === 'function';
}

function fromStore(store) {
	return Observable.create(observer => {
		const unsubscribe = store.subscribe(() => observer.onNext(store.getState()));
		return {dispose() { unsubscribe() }};
	}).startWith(store.getState());
}
