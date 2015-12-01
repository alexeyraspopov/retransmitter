import React from 'react';
import {Observable, Disposable, helpers} from 'rx';
import invariant from 'invariant';
import assign from 'object-assign';

export default class Container extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			status: 'pending',
			fragments: {},
			error: null,
		};
		this.subscription = Disposable.create();
	}

	fetch() {
		const fragments = this.observe();

		const streams = Object.keys(fragments)
			.map(name => {
				const fragment = fragments[name];
				const observable = fromEverything(fragment);

				return observable.map(data => wrapFragment(name, data));
			});

		return Observable.combineLatest(streams)
			.map(fragments => fragments.reduce((a, b) => assign(a, b), {}))
			.subscribe(
				results => this.success(results),
				error => this.failure(error)
			);
	}

	observe() {
		invariant(false, 'Transmitter.Container requires `observe` method to be implemented');
	}

	success(fragments) {
		this.setState({status: 'success', fragments});
	}

	failure(error) {
		this.setState({status: 'failure', error});
	}

	pending() {
		this.setState({status: 'pending', error: null});
	}

	componentWillMount() {
		this.subscription = this.fetch();
	}

	componentWillUnmount() {
		this.subscription.dispose();
	}

	shouldComponentUpdate(nextProps, nextState) {
		return typeof this.shouldComponentUpdate !== 'function' || this.shouldContainerUpdate(nextProps, nextState);
	}

	componentWillReceiveProps(nextProps) {
		this.pending();
		this.subscription.dispose();
		this.subscription = this.fetch();
	}

	render() {
		invariant(false, 'Transmitter.Container requires `render` method to be implemented');
	}
}

function fromEverything(object) {
	if (helpers.isPromise(object)) return Observable.fromPromise(object);
	if (helpers.isFunction(object)) return Observable.just(object);
	// assume that `object` is Observable by default
	return object;
}

function wrapFragment(name, value) {
	return {[name]: value};
}
