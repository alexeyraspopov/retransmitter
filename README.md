# Transmitter

Async data fetching from different sources for React components made easy.

The project is under heavy development and the API can be changed.

Inspired by [Relay](https://facebook.github.io/relay). An attempt to create unified container solution.

***NB***: For now Transmitter depends on [Rx](https://github.com/Reactive-Extensions/RxJS) (used as peer dependency).

## Quick Look

```javascript
import AsyncComponent from 'retransmitter/lib/AsyncComponent';

// this component will be used for react-router
// like <Route path="/users/:userId" component={UserInfoPage} />
export default AsyncComponent(UserInfoPage);

async function UserInfoPage({params: {userId}}) {
	const user = await UsersAPI.find({id: userId});

	return <UserInfo user={user} />;
}
```

```javascript
import Container from 'retransmitter/lib/Container';
import fromStore from 'retransmitter/lib/fromStore';

class TodosListContainer extends Container {
	observe() {
		return {
			todos: TodosAPI.getAll(),
			query: fromStore(TheStore).map(state => state.query),
		};
	}

	render() {
		const {status, todos, query} = this.state;

		switch (status) {
		case 'SUCCESS':
			return <TodosList todos={todos} query={query} />;

		case 'FAILURE':
			return <ErrorMessage />;

		case 'PENDING':
		default:
			return <Spinner />;
		}
	}
}
```

## Introduction

Read more [in docs](docs/Introduction.md)

## Installation

Install via NPM:

```bash
npm install --save retransmitter
```

Require the lib in your code:

```javascript
import Transmitter from 'retransmitter';
```

Also you can require particular components:

```javascript
import AsyncComponent from 'retransmitter/lib/AsyncComponent';
import Container from 'retransmitter/lib/Container';
import fromStore from 'retransmitter/lib/fromStore';
```

Still using that old syntax?

```javascript
var Transmitter = require('retransmitter');
```

***NB***: If you're NPM3 user please make sure you have [these dependencies](https://github.com/alexeyraspopov/retransmitter/blob/85b82a768725f78db3750a7916690b3b483a4e23/package.json#L33-L34) installed. I'll make these dependencies as own dependencies after NPM3 will be used widely.

```bash
npm install --save react react-dom rx
```

## How it works

Just `combineLatest` operator magic. See more [on ReactiveX.io](http://reactivex.io/documentation/operators/combinelatest.html).

## API

TBD

## Support

 - [x] Promises
 - [x] Observables
 - [x] Falcor (since it uses Promises and Observables)
 - [x] Stores (Flux, Redux)
 - [ ] CSP channels
 - [ ] Relay
