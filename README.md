# Transmitter

Async declarative component-based (and other buzzwords) programming made easy.

Inspired by [Relay](https://facebook.github.io/relay). An attempt to create unified container solution.

***NB***: For now Transmitter depends on [Rx](https://github.com/Reactive-Extensions/RxJS) (used as peer dependency).

## Introduction

 1. Static view
 2. Decomposition
 3. From the bottom
 4. Reactive Programming 101
 5. Information source
 6. Container and reusability

Let's treat UI as pure function of data.

```javascript
View = (Data) => UI;
```

Using this function in mind we can imagine our stateful UI as a set of "snapshots": particular UIs based on particular data in particular moment of time. Data changes and function is called again with new params and rendered view is updated.

```
┌─ Route ──────────────────┐
│                          │
│ ┌─ Container ──────────┐ │
│ │                      │ │
│ │ ┌─ List ───────────┐ │ │
│ │ │                  │ │ │
│ │ │ ┌─ Item ───────┐ │ │ │
│ │ │ │              │ │ │ │
│ │ │ └──────────────┘ │ │ │
│ │ └──────────────────┘ │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

```
┌─ Container ──────────┐
│                      │
│ ┌─ Item ───────────┐ │
│ │                  │ │
│ └──────────────────┘ │
└──────────────────────┘
```

Every peace of data we're working with will be singular or plural.

Рассматриваем клиентские приложения с сервером. Основа — данные. Учитывая специфику REST — это всегда списки. Все начинается с разработки вьюшки для конкретного элемента списка. По аналогии мы описываем функцию для обработки одного элемента потом применяем её к списку (map, filter). Когда этот элемент разработан, делаем элемент списка — принимает массив, использует элементы итемов массива, знает как сортировать, и так далее. Списку нужен endpoint (будь-то Flux стор или внешнее хранилище по Relay) — делаем контейнер с описанием фетчинга (см. react-transmit). Дальше, этот список должен как-то выводиться на экран, а это уже страница привязанная к роуту — еще один контейнер. Учитывая вложенность ресурсов, к примеру ты хочешь получить список статей конкретного пользователя (/users/SOME_USER_ID/articles). Контейнер роута будет знать о параметра SOME_USER_ID и передавать его контейнеру ниже, который уже будет заниматься фетчингом данных и созданием списка. Основная фишка подхода не в слоистой архитектуре, а в изолированной разработке. Ты должен начинать снизу и делать компоненты отвязываясь от среды, в которой они варятся.

Тут идея в том, что каждый слой получает данные из пропсов, и последующий элемент на уровне выше по сути занимается "подготовкой" пропсов для элементов вниз по иерархии. Но во время изолированной разработки снизу вверх ты не должен об этом думать — ты просто юзаешь пропсы, описываешь для них тесты и спецификацию.

В случае канонического использования флакса ты дополнительно будешь хендлить загрузку данных и их хранение в сторе. Это дополнительных три экшна, один AC и один хендлер в сторе. И так для каждого ресурса.

Поэтому, это решение — эволюция идей Флакса. Можешь посмотреть на Relay, они стали делать тоже самое.
Описывать зависимость данных ближе к месту их использования
Single source of truth. Это значит не "только из стора", а "только с точно определенного information source"

В дополнение к "будет загружаться каждый раз при показе элемента на экране":
Ты все равно не знаешь когда самый правильный момент для загрузки
Загружать все на старте приложения — в любом случае не лучший вариант
Понадобиться дополнительная обработка фейлов, так как загрузка была инициирована не пользователем (все же должно оставаться в тайне, под капотом)
Для этого в retransmitter я сделал возможность показать конкретный элемент если идет загрузка и если что-то зафейлилось. В pending элемент попадает onAbort — колбек для остановки загрузки. В failure элемент попадает onRetry — колбек для повторной загрузки (что в свою очередь снова показывает pending и делает загрузку данных)

## Installation

Install via NPM:

```bash
npm install --save retransmitter
```

Require the lib in your code:

```javascript
import Transmitter from 'retransmitter';
```

***NB***: If you're NPM3 user please make sure you have [these dependencies](https://github.com/alexeyraspopov/retransmitter/blob/06e1fe52e6ffb4e409bd14a6adf5205ca9b1f7c1/package.json#L32-L34) installed. I'll make these dependencies as own dependencies after NPM3 will be used widely.

```bash
npm install --save react react-dom rx
```

## How it works

```
--0---------------------------|>
----1-------------------------|>
----{0, 1}--------------------|>
```

Just `combineLatest` operator magic. See more [on ReactiveX.io](http://reactivex.io/documentation/operators/combinelatest.html).

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

Use if you want to pass dummy or constant data via fragment. If you want to pass event hook (ie Flux's Action Creator) you don't need to wrap it.

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
	},
	onSelect() {
		return ItemsActions.selectItem;
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
 - [x] Falcor (since it uses Promises and Observables)
 - [x] Stores (Flux, Redux) (See [`Transmitter.fromStore()`](#transmitterfromstorestore))
 - [ ] CSP channels
 - [ ] Relay
