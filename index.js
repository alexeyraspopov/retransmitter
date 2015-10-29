import React, {PropTypes} from 'react';
import {Observable, helpers} from 'rx';
import assign from 'object-assign';
import invariant from 'invariant';

export default {create: Container, fromPromise: Observable.fromPromise, fromStore};

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

		success(results) {
			this.setState({
				status: 'success',
				fragments: results.reduce((a, b) => assign(a, b), {}),
			});
		},

		failure(error) {
			this.setState({
				status: 'failure',
				error: {type: 'FETCH_FAILED', error},
			});
		},

		pending() {
			this.setState({
				status: 'pending',
				error: null,
			});

			this.disposable.dispose();
		},

		fetchFragment(fragment, variables, name) {
			const fragmentContainer = fragment(variables);
			const observable = fromEverything(fragmentContainer);

			return observable.map(data => ({[name]: data}));
		},

		fetch(newVariables) {
			const variables = assign({}, initialVariables, newVariables);

			const streams = Object.keys(fragments)
				.map(key => this.fetchFragment(fragments[key], variables, key));

			return Observable.combineLatest(streams)
				.subscribe(
					results => this.success(results),
					error => this.failure(error)
				);
		},

		refetch() {
			this.pending();
			this.disposable = this.fetch(this.props.variables);
		},

		componentWillMount() {
			this.disposable = this.fetch(this.props.variables);
		},

		componentWillUnmount() {
			this.disposable.dispose();
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				this.pending();
				this.disposable = this.fetch(nextProps.variables);
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
				// TODO: pass onCancel
				return React.createElement(componentEnum.pending, this.props);
			}
		},
	});
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

function fromEverything(object) {
	if (helpers.isPromise(object)) {
		return Observable.fromPromise(object);
	}

	// assume that fragmentContainer is Observable by default
	return object;
}

function fromStore(store) {
	return Observable.create(observer => {
		const unsubscribe = store.subscribe(() => observer.onNext(store.getState()));
		return {dispose() { unsubscribe() }};
	}).startWith(store.getState());
}
