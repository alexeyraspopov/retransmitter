# Transmitter

Async declarative component-based (and other buzzwords) programming made easy.

Inspired by [Relay](https://facebook.github.io/relay). An attempt to create unified container solution.

***NB***: For now Transmitter depends on [Rx](https://github.com/Reactive-Extensions/RxJS) (used as peer dependency).

## Intro

*Here should be an explanation of principle "from the bottom to the top".*

## Installation

Install via NPM:

```bash
npm install --save retransmitter
```

Require the lib in your code:

```javascript
import Transmitter from 'retransmitter';
```

***NB***: If you're NPM3 user please make sure you have [these dependencies](https://github.com/alexeyraspopov/retransmitter/blob/bc005d8da250d89037bf2b15d672c1232fbc7e47/package.json#L28-L32) installed.

## How it works

```
--0---------------------------|>
----1-------------------------|>
----{0, 1}--------------------|>
```

See more [here](http://rxmarbles.com/#combineLatest).

## API

### `Transmitter.create(Component, options)`

 * `Component` — React Component or enum `{pending, success, failure}` of React Components.
 * `options` — object
   * `initialVariables` **(optional)**
   * `fragments`
   * `shouldContainerUpdate()` **(optional)**

### `Transmitter.fromStore(store)`

Creates an Observable from Store ([Flux](https://github.com/facebook/flux), [Redux](https://github.com/rackt/redux), etc). Store is an object that provides next API:

 * `getState()` — returns current state of this store.
 * `subscribe()` — adds a listener and returns `unsubscribe` function.

### `Transmitter.fromPromise(promise)`

This method is not required for using. If you're using native Promises you can just return them in fragments.

See more [in RxJS docs](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/frompromise.md).

### `Transmitter.fromValue(value)`

See more [in RxJS docs](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/return.md).

## Examples

```javascript
function Item({key, title, description}) {
	return (
		<article>
			<h2>{title}</h2>
			<p>{description}</p>
			<p><a href={`/articles/${key}`}>Read more</a></p>
		</article>
	);
}
```

```javascript
function ItemsList({items = []}) {
	return (
		<section>
			{items.map(({id, title, description}) =>
				<Item key={id} title={title} description={description} />
			)}
		</section>
	);
}
```

```javascript
ItemsListContainer = Transmitter.create(ItemsList, {
	items() {
		return fetch('/items')
			.then(r => r.json());
	}
});
```

```javascript
ReactDOM.render(<ItemsListContainer />, ...);
```

## Multiple choise component

```javascript
ItemsListContainer = Transmitter.create({
	pending: LoadingSpinner,
	success: ItemsList,
	failure: ItemsListError
}, {
	items() {
		return fetch('/items')
			.then(r => r.json());
	},
	query() {
		return Transmitter.fromStore(QueryStore);
	}
});
```

```
--[items]-------------------------------|> (from items fragment)
------"query"----------"query2"---------|> (from query store)
------{items, query}---{items, query2}--|> (result that will be passed to ItemsList)
```

When `<ItemsListContainer />` is added to the view `pending` component will be rendered at first. `pending` component will be rendered with props:

 * `onAbort` — the callback that used as event hook and dispose all fragments fetching processes.

After loading is finished `success` or `failure` component will be rendered (depends on results). `failure` component will receive next props:

 * `error` — the error instance that will be received in failed getter.
 * `onRetry` — the callback that can be attached as event hook and will restart data fetching.

## Support

 - [x] Promises
 - [x] Observables
 - [x] Stores (Flux, Redux)
 - [x] Falcor (since it uses Promises and Observables)
 - [ ] CSP channels
 - [ ] Relay
