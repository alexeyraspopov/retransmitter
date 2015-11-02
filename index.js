import React, {PropTypes} from 'react';
import {Observable, helpers} from 'rx';
import assign from 'object-assign';
import invariant from 'invariant';

const FETCH_FAILED = 'FETCH_FAILED';
const FETCH_ABORTED = 'FETCH_ABORTED';

export default {
	create: Container,
	fromPromise: Observable.fromPromise,
	fromValue: Observable.just,
	fromStore,
	FETCH_FAILED,
	FETCH_ABORTED,
};

function Container(Component, options) {
	const {
		fragments = {},
		shouldContainerUpdate = () => true,
		initialVariables = {},
	} = options;

	const componentEnum = enumerate(Component);
	const displayName = `${componentEnum.success.displayName || componentEnum.success.name}Container`;
	const isRootContainer = options.hasOwnProperty('initialVariables');

	return React.createClass({
		displayName,

		propTypes: {
			variables: PropTypes.object,
		},

		statics: {
			isRootContainer,
			getFragment(name, variables) {
				invariant(fragments.hasOwnProperty(name), `Fragment ${name} of ${displayName} doesn't exist`);

				const allVariables = assign({}, initialVariables, variables);

				return fragments[name](allVariables);
			},
		},

		getInitialState() {
			return {
				status: 'pending',
				fragments: {},
				error: null,
			};
		},

		success(results) {
			const combinedFragments = results.reduce((a, b) => assign(a, b), {});

			this.setState({status: 'success', fragments: combinedFragments});
		},

		failure(error, type) {
			const errorInstance = {type, error};

			this.setState({status: 'failure', error: errorInstance});
		},

		pending() {
			this.setState({status: 'pending', error: null});
			this.subscription.dispose();
		},

		fetchFragment(name, variables) {
			const fragmentContainer = fragments[name](variables);
			const observable = fromEverything(fragmentContainer);

			return observable.map(data => wrapFragment(name, data));
		},

		fetch(newVariables) {
			const variables = assign({}, initialVariables, newVariables);
			const streams = Object.keys(fragments)
				.map(name => {
					if (this.props.hasOwnProperty(name)) {
						return Observable.just(wrapFragment(name, this.props[name]));
					}

					return this.fetchFragment(name, variables);
				});

			return Observable.combineLatest(streams)
				.subscribe(
					results => this.success(results),
					error => this.failure(error, FETCH_FAILED)
				);
		},

		refetch() {
			this.pending();
			this.subscription = this.fetch(this.props.variables);
		},

		abort() {
			this.subscription.dispose();
			this.failure(null, FETCH_ABORTED);
		},

		componentWillMount() {
			this.subscription = this.fetch(this.props.variables);
		},

		componentWillUnmount() {
			this.subscription.dispose();
		},

		componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				this.pending();
				this.subscription = this.fetch(nextProps.variables);
			}
		},

		render() {
			const {fragments, error, status} = this.state;
			const onRetry = () => this.refetch();
			const onAbort = () => this.abort();

			switch (status) {
			case 'success':
				return React.createElement(componentEnum.success, assign({}, fragments, this.props));
			case 'failure':
				return React.createElement(componentEnum.failure, assign({error, onRetry}, this.props));
			case 'pending':
				// falls through
			default:
				return React.createElement(componentEnum.pending, assign({onAbort}, this.props));
			}
		},
	});
}

const EmptyComponent = React.createClass({
	render() { return null; }
});

function wrapFragment(name, value) {
	return {[name]: value};
}

function enumerate(target) {
	const isEnumerableComponent = typeof target === 'object';

	if (isEnumerableComponent) {
		invariant(isReactComponentEnum(target), 'Success, Failure and Pending should be React components');
		invariant(helpers.isFunction(target.success), 'Success component should be specified');

		return assign({success: EmptyComponent, pending: EmptyComponent, failure: EmptyComponent}, target);
	}

	return {success: target, pending: EmptyComponent, failure: EmptyComponent};
}

function isReactComponentEnum(target) {
	return ['success', 'failure', 'pending']
		.filter(type => target.hasOwnProperty(type))
		.every(type => helpers.isFunction(target[type]));
}

function fromEverything(object) {
	if (helpers.isPromise(object)) {
		return Observable.fromPromise(object);
	}

	if (helpers.isFunction(object)) {
		return Observable.just(object);
	}

	// assume that `object` is Observable by default
	return object;
}

function fromStore(store) {
	invariant(typeof store.getState === 'function', 'Store should have getState method which returns current state');
	invariant(typeof store.subscribe === 'function', 'Store should have subscribe method which adds listener for change event');

	return Observable.create(observer => {
		const pushState = () => observer.onNext(store.getState());
		const unsubscribe = store.subscribe(pushState);

		invariant(typeof unsubscribe === 'function', 'Subscribe method should return a function which removes change listener when called');

		return {dispose: unsubscribe};
	}).startWith(store.getState());
}
