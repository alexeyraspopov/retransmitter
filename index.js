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
	const variablesPropType = isRootContainer ? propTypesShape(initialVariables) : PropTypes.object;

	return React.createClass({
		displayName: `${containerName}Container`,

		propTypes: {
			variables: variablesPropType,
		},

		statics: {
			isRootContainer,
			getFragment(name, variables) {
				invariant(fragments.hasOwnProperty(name), `Fragment ${name} of ${containerName} doesn't exist`);

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

		failure(error) {
			this.setState({
				status: 'failure',
				error: {type: 'FETCH_FAILED', error},
			});
		},

		pending() {
			this.setState({status: 'pending', error: null});
			this.subscription.dispose();
		},

		fetchFragment(name, variables) {
			const fragmentContainer = fragments[name](variables);
			const observable = fromEverything(fragmentContainer);

			return observable.map(data => ({[name]: data}));
		},

		fetch(newVariables) {
			const variables = assign({}, initialVariables, newVariables);
			const streams = Object.keys(fragments)
				.map(name => {
					if (this.props.hasOwnProperty(name)) {
						return Observable.just({[name]: this.props[name]});
					}

					return this.fetchFragment(name, variables);
				});

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
				return React.createElement(componentEnum.success, assign({}, fragments, this.props));
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
		invariant(helpers.isFunction(target.success), 'Success component should be specified');

		return target;
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

	// assume that fragmentContainer is Observable by default
	return object;
}

function fromStore(store) {
	invariant(typeof store.getState === 'function', 'Store should have getState method which returns current state');
	invariant(typeof store.subscribe === 'function', 'Store should have subscribe method which adds listener for change event');

	return Observable.create(observer => {
		const pushState = () => observer.onNext(store.getState());
		const unsubscribe = store.subscribe(pushState);

		invariant(typeof unsubscribe === 'function', 'Subscribe method should return a function which removes listener when called');

		return {dispose: unsubscribe};
	}).startWith(store.getState());
}

function propTypesShape(initialVariables) {
	const shape = Object.keys(initialVariables)
		.reduce((acc, key) => assign(acc, {[key]: PropTypes.any}), {});

	return PropTypes.shape(shape);
}
