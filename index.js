import React, {PropTypes} from 'react';
import {Observable, helpers} from 'rx';
import assign from 'object-assign';
import invariant from 'invariant';

export default {create: Container, fromPromise: Observable.fromPromise, fromStore};

function Container(Component, options) {
	const {
		fragments = {},
		shouldContainerUpdate = () => true,
		initialVariables = {},
	} = options;

	const componentEnum = enumerate(Component);
	const containerName = componentEnum.success.displayName || componentEnum.success.name;
	const isRootContainer = options.hasOwnProperty('initialVariables');

	return React.createClass({
		displayName: `${containerName}Container`,

		propTypes: {
			variables: PropTypes.object,
		},

		statics: {
			isRootContainer,
			getFragment(name, variables) {},
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

			this.subscription.dispose();
		},

		fetchFragment(name, variables) {
			const fragmentContainer = fragments[name](variables);
			const observable = fromEverything(fragmentContainer);

			return observable.map(data => ({[name]: data}));
		},

		fetch(newVariables) {
			const variables = assign({}, initialVariables, newVariables);

			// TODO: check fragment availability via props
			const streams = Object.keys(fragments)
				.map(key => this.fetchFragment(key, variables));

			return Observable.combineLatest(streams)
				.subscribe(
					results => this.success(results),
					error => this.failure(error)
				);
		},

		refetch() {
			this.pending();
			this.subscription = this.fetch(this.props.variables);
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
		return {dispose: unsubscribe};
	}).startWith(store.getState());
}
