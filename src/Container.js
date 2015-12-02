import React from 'react';
import {Observable, Disposable} from 'rx';
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

	refetch() {
		this.pending();
		this.subscription.dispose();
		this.subscription = this.fetch();
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

	componentWillReceiveProps() {
		this.refetch();
	}

	render() {
		invariant(false, 'Transmitter.Container requires `render` method to be implemented');
	}
}

function fromEverything(object) {
	if (object instanceof Promise) return Observable.fromPromise(object);
	if (Observable.isObservable(object)) return object;

	return Observable.just(object);
}

function wrapFragment(name, value) {
	return {[name]: value};
}
