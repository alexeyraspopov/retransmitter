import {Observable} from 'rx';
import invariant from 'invariant';

export default function fromStore(store) {
	invariant(typeof store.getState === 'function', 'Store should have getState method which returns current state');
	invariant(typeof (store.subscribe || store.addListener) === 'function', 'Store should have subscribe method which adds listener for change event');

	return Observable.create(observer => {
		const pushState = () => observer.onNext(store.getState());
		// FIXME: this breaks context
		const unsubscribe = (store.subscribe || store.addListener)(pushState);

		invariant(typeof unsubscribe === 'function', 'Subscribe method should return a function which removes change listener when called');

		return {dispose: unsubscribe};
	}).startWith(store.getState());
}
