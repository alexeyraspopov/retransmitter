# Transmitter ![](https://travis-ci.org/alexeyraspopov/container.svg)

Async declarative component-based (and other buzzwords) programming made easy.

***NB***: For now Transmitter depends on [Rx](https://github.com/Reactive-Extensions/RxJS) (used as peer dependency).

## Intro

*Here should be an explanation of principle "from the bottom to the top".*

## How it works

```
--0---------------------------|>
----1-------------------------|>
----{0, 1}--------------------|>
```

See more [here](http://rxmarbles.com/#combineLatest).

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

When `<ItemsListContainer />` is added to the view `pending` element will be rendered at first. After loading is finished `success` or `failure` element will be rendered (depends on results). `failure` element will receive next props:

 * `error` — the error instance that will be received in failed getter
 * `onRetry` — the callback that can be attached as event hook and will restart data fetching

## Support

 - [x] Promises
 - [x] Observables (instances should have `subscribe()` that may return `{ dispose() }`)
 - [ ] Stores (instances should have `subscribe()` and `getState()`)
   - [x] `Transmitter.fromStore(store)`
 - [ ] CSP channels
