import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import AsyncComponent from './src/AsyncComponent';
import Transmitter from './src/Container';
import fromStore from './src/fromStore';
import * as Redux from 'redux';
import * as Flux from 'flux';
import * as FluxUtils from 'flux/utils';
import assert from 'assert';
import sinon from 'sinon';

function log(target) {
	console.log(require('util').inspect(target, { depth: 3, showHidden: true }));
}

function runAsync(block) {
	return new Promise((resolve, reject) => setTimeout(async () => {
		try {
			resolve(await block());
		} catch (error) {
			reject(error);
		}
	}, 10));
}

describe('AsyncComponent', () => {
	const Component = props => <div />;

	it('should create React component', () => {
		const ComponentFetch = async props => {
			await Promise.resolve(13);
			return <Component />;
		};

		const Container = AsyncComponent(ComponentFetch);

		assert.ok(TestUtils.isElement(<Container />), 'Container should be a React component');
		assert.equal(Container.displayName, 'Transmitter(ComponentFetch)', 'Container should have Component\'s name with prefix');
	});

	it('should render original component with resolved data', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(13);
			return <Component data={data} />;
		};

		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(TestUtils.isElementOfType(Output, Component), 'Returned component should be rendered');
			assert.deepEqual(Output.props, {data: 13}, 'Component should be rendered with data fetched via async function');
		});
	});

	it('should refetch data when props is changed', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(props.id);
			return <Component data={data + 1} />;
		};

		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		// TODO: add spy for `componentWillReceiveProps`
		ReactShallow.render(<Container id={1} />);
		ReactShallow.render(<Container id={2} />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.deepEqual(Output.props, {data: 3}, '');
		});
	});

	it('should work with rejected promises', () => {
		const ErrorMessage = props => <div />;
		const ComponentFetch = async props => {
			try {
				const data = await Promise.reject(13);
				return <Component />;
			} catch (e) {
				return <ErrorMessage />;
			}
		};

		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();
			assert.ok(TestUtils.isElementOfType(Output, ErrorMessage), 'Async component should work with failure state of async function');
		});
	});

	it('should throw an error if function is not async', () => {
		const ComponentFetch = props => <div />;
		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		assert.throws(() => ReactShallow.render(<Container />), /doesn't return Promise/);
	});

	it('should render <noscript /> until promise is not fulfilled', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(13);
			return <Component />;
		};

		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		const Output = ReactShallow.getRenderOutput();
		assert.ok(TestUtils.isElementOfType(Output, 'noscript'), 'Not fulfilled async component should render <noscript />');
	});

	it('should throw an error if async function result is not React element', () => {
		const ComponentFetch = async props => {
			await Promise.resolve(13);
			return 1;
		};
		const Container = AsyncComponent(ComponentFetch);

		// HACK: since I don't know how to catch async exception I run the method manually
		assert.throws(() => Container.prototype.__reactAutoBindMap.updateState(1), /is not a React element/);
	});

	it('should call `onFetch` after loading is finished', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(13);
			return <Component data={data} />;
		};
		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();
		const onFetch = sinon.spy();

		ReactShallow.render(<Container onFetch={onFetch} />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(onFetch.calledWith('success'), '`onFetch` should be called with actual loading status');
		});
	});

	it('should crash if reject path is unhandled', () => {
		const ComponentFetch = async props => {
			await Promise.reject(new Error('something'));
			return <Component />;
		};
		const Container = AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();
		const onFetch = sinon.spy();

		ReactShallow.render(<Container onFetch={onFetch} />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();
			assert.ok(!onFetch.called, '...');
		});
	});
});

describe('Container', () => {
	class Container extends Transmitter {
		constructor(props) {
			super(props);
		}

		render() {
			return null;
		}
	}

	it('should produce React element', () => {
		assert.ok(React.isValidElement(<Container />), 'Container should produce React component');
	});

	it('should throw an error if `observe` method is not defined', () => {
		const ReactShallow = TestUtils.createRenderer();

		assert.throws(() => ReactShallow.render(<Container />), /Transmitter.Container requires `observe` method/);
	});
});

describe('fromStore', () => {
	it('should throws an error if store does not have getState method', () => {
		assert.throws(() => fromStore({}), /Store should have getState method/);
	});

	it('should throws an error if store does not have subscribe method', () => {
		assert.throws(() => fromStore({getState: () => null}), /Store should have subscribe method/);
	});

	it('should work with addListener() (Facebook Flux)', (done) => {
		class CustomStore extends FluxUtils.ReduceStore {
			getInitialState() {
				return 13;
			}

			reduce(state, action) {
				switch (action.type) {
				default:
					return state;
				}
			}
		}

		const dispatcher = new Flux.Dispatcher();
		const store = new CustomStore(dispatcher);
		const stream = fromStore(store);

		stream.subscribe(state => {
			assert.equal(state, 13, 'Stream should start with initial state of store');
			done();
		});
	});

	it('should work with subscribe() (Redux)', (done) => {
		const store = Redux.createStore((state = 13, action) => {
			switch (action.type) {
			default:
				return state;
			}
		});
		const stream = fromStore(store);

		stream.subscribe(state => {
			assert.equal(state, 13, 'Stream should start with initial state of store');
			done();
		});
	});

	it('should push updates from store', () => {
		const store = Redux.createStore((state = 13, action) => {
			switch (action.type) {
			case 'incremented':
				return state + 1;
			default:
				return state;
			}
		});
		const stream = fromStore(store);
		const history = [];

		stream.subscribe(state => history.push(state));
		store.dispatch({type: 'incremented'});
		assert.deepEqual(history, [13, 14], 'Stream have to push all changes from store');
	});

	xit('should unsubscribe on dispose', () => {});
});
