import {Observable} from 'rx';
import invariant from 'invariant';

export default function fromStore(store) {
	invariant(typeof store.getState === 'function', 'Store should have getState method which returns current state');
	invariant(typeof (store.subscribe || store.addListener) === 'function', 'Store should have subscribe method which adds listener for change event');

	return Observable.create(observer => {
		const pushState = () => observer.onNext(store.getState());
		const unsubscribe = subscribe(store, pushState);

		return {dispose: unsubscribe};
	}).startWith(store.getState());
}

function subscribe(store, onNext) {
	const disposable = store.subscribe ? store.subscribe(onNext) : store.addListener(onNext);

	switch (typeof disposable) {
	case 'function':
		return disposable;
	case 'object':
		// Hello, Facebook's FluxStore
		invariant(typeof disposable.remove === 'function', 'Subscription object should have `remove` method');
		return disposable;
	default:
		invariant(false, 'Subscribe method should return a function which removes change listener when called');
	}
}
