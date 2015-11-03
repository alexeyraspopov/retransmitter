import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react/lib/ReactTestUtils';
import Redux from 'redux';
import {Observable} from 'rx';
import Transmitter from './index';
import jsdom from 'mocha-jsdom';
import assert from 'assert';
import sinon from 'sinon';

describe('Transmitter', () => {
	jsdom();

	const Component = (props) => <div />;
	const FailureComponent = (props) => <div />;
	const VALUE = 'value';
	const ERROR = new Error('Something happened');
	const FIRST_ACTION_TIMEOUT = 1;
	const SECOND_ACTION_TIMEOUT = 10;
	const ShallowRender = (view) => {
		const ReactShallow = TestUtils.createRenderer();
		ReactShallow.render(view);
		return ReactShallow.getRenderOutput();
	};

	it('should create React component', () => {
		const Container = Transmitter.create(Component, {});

		assert.ok(TestUtils.isElement(<Container />), 'Container should be a React component');
		assert.equal(Container.displayName, 'Transmitter(Component)', 'Container should have Component\'s name with suffix');
	});

	it('should create React component if enum is used', () => {
		const Container = Transmitter.create({success: Component}, {});

		assert.ok(TestUtils.isElement(<Container />), 'Container should be a React component');
		assert.equal(Container.displayName, 'Transmitter(Component)', 'Container should have Component\'s name with suffix');
	});

	it('should raise an error if no components are specified', () => {
		assert.throws(() => Transmitter.create({success: null}, {}), /Success, Failure and Pending should be React components/);
		assert.throws(() => Transmitter.create({}, {}), /Success component should be specified/);
	});

	it('should render Pending component by default', () => {
		const Spinner = () => <p>Loading...</p>;
		const Container = Transmitter.create({success: Component, pending: Spinner}, {});
		const RenderOutput = ShallowRender(<Container />);

		assert.ok(TestUtils.isElementOfType(RenderOutput, Spinner), 'Pending component should be rendered');
	});

	it('should render Success component with data fetched from fragments', (done) => {
		const thingFragment = sinon.stub().returns(new Promise((resolve) => {
			setTimeout(resolve, FIRST_ACTION_TIMEOUT, VALUE);
		}));
		const Container = Transmitter.create(Component, {
			fragments: {thing: thingFragment}
		});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		setTimeout(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(TestUtils.isElementOfType(Output, Component), 'Success component should be rendered');
			assert.deepEqual(Output.props, {thing: VALUE}, 'Component should be rendered with data fetched via fragments');
			done();
		}, SECOND_ACTION_TIMEOUT);
	});

	it('should render Failure component with error raised from fragments', (done) => {
		const thingFragment = sinon.stub().returns(new Promise((_, reject) => {
			setTimeout(reject, FIRST_ACTION_TIMEOUT, ERROR);
		}));
		const Container = Transmitter.create({success: Component, failure: FailureComponent}, {
			fragments: {thing: thingFragment}
		});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		setTimeout(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(TestUtils.isElementOfType(Output, FailureComponent), 'Failure component should be rendered');
			assert.deepEqual(Output.props.error, {type: Transmitter.FETCH_FAILED, error: ERROR}, 'Component should be rendered with error raised via fragments');
			assert.ok(typeof Output.props.onRetry === 'function', 'onRetry callback should be passed as prop');
			done();
		}, SECOND_ACTION_TIMEOUT);
	});

	it('should call fragments with passed variables', () => {
		const thingFragment = sinon.stub().returns(Promise.resolve(VALUE));
		const Container = Transmitter.create(Component, {
			fragments: {thing: thingFragment}
		});
		const variables = {id: VALUE};
		const RenderOutput = ShallowRender(<Container variables={variables} />);

		assert.ok(thingFragment.calledWith(variables), 'Fragment should be called with passed variables');
	});

	it('should use initial variables if actual are not specified', () => {
		const thingFragment = sinon.stub().returns(Promise.resolve(VALUE));
		const Container = Transmitter.create(Component, {
			initialVariables: {a: VALUE},
			fragments: {thing: thingFragment}
		});
		const variables = {id: VALUE};
		const RenderOutput = ShallowRender(<Container variables={variables} />);

		assert.ok(thingFragment.calledWith({a: VALUE, id: VALUE}), 'Fragment should be called with passed variables mixed with initial variables');
	});

	it('should be root container if initial variables are passed', () => {
		const Container = Transmitter.create(Component, {});
		const RootContainer = Transmitter.create(Component, {
			initialVariables: {thing: null}
		});

		assert.ok(!Container.isRootContainer, 'Container without variables should not be root');
		assert.ok(RootContainer.isRootContainer, 'Container without variables should be root');
	})

	xit('should work with simple observables', () => {
		// TODO: implement this test
	});

	// waiting for https://github.com/facebook/react/pull/5247 being merged
	xit('should work with stores', () => {
		const INITIAL_STATE = 0;
		const StateReduce = (state = INITIAL_STATE, action) => state + action.value;
		const Store = Redux.createStore(StateReduce);
		const Container = Transmitter.create(Component, {
			fragments: {thing: () => Transmitter.fromStore(Store)}
		});
		const RenderOutput = ShallowRender(<Container />);

		assert.equal(RenderOutput.props.thing, INITIAL_STATE, 'Container should be rendered with initial state of the store');
		// TODO: need more asserts
	});

	it('should dispose subscriptions after unmount', () => {
		const RENDER_ROOT = document.createElement('div');
		const disposeStub = sinon.spy();
		const Disposable = Observable.create(observer => ({dispose: disposeStub}));
		const Container = Transmitter.create(Component, {
			fragments: {thing: () => Disposable}
		});

		ReactDOM.render(<Container />, RENDER_ROOT);
		ReactDOM.unmountComponentAtNode(RENDER_ROOT);

		assert.ok(disposeStub.called, 'Dispose method should be called if Container was unmounted');
	});

	// waiting for https://github.com/facebook/react/pull/5247 being merged
	xit('should immediately render Success component if fragments are passed via props', () => {
		const thingFragment = sinon.stub().returns(new Promise((resolve) => {
			setTimeout(resolve, FIRST_ACTION_TIMEOUT, VALUE);
		}));
		const Container = Transmitter.create(Component, {
			fragments: {thing: thingFragment}
		});
		const RenderOutput = ShallowRender(<Container thing={VALUE} />)

		assert.ok(!thingFragment.called, 'Fragment should not be called');
		assert.ok(TestUtils.isElementOfType(RenderOutput, Component), 'Success component should be rendered');
		assert.deepEqual(RenderOutput.props, {thing: VALUE}, 'Component should be rendered with data fetched via fragments');
	});

	xit('should handle failed streams and render Failure element', () => {
		// TODO: implement this test
	});

	xit('should render `null` for not specified components', () => {
		// TODO: implement this test
	});

	xit('should restart fetching if onRetry was called', () => {
		// TODO: implement this test
	});

	xit('should abort fetching if onAbort was called', () => {
		// TODO: implement this test
	});

	xit('should use custom `shouldContainerUpdate` hook', () => {
		// TODO: implement this test
	});

	xit('should be able to get child fragment', () => {
		// TODO: implement this test
	});

	xit('should pass functions from fragments', () => {
		// TODO: implement this test
	});
});
