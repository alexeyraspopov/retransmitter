import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Container from './index';
import assert from 'assert';
import sinon from 'sinon';

describe('Container', () => {
	// TODO: describe use cases
	const Component = (props) => <div />;
	const VALUE = 'value';
	const FIRST_ACTION_TIMEOUT = 1;
	const SECOND_ACTION_TIMEOUT = 2;

	it('should create React component', () => {
		const PContainer = Container.create(Component, {});

		assert.ok(TestUtils.isElement(<PContainer />), 'Container should be a React component');
		assert.equal(PContainer.displayName, 'ComponentContainer', 'Container should have Component\'s name with suffix');
	});

	it('should create React component if enum is used', () => {
		const PContainer = Container.create({success: Component}, {});

		assert.ok(TestUtils.isElement(<PContainer />), 'Container should be a React component');
		assert.equal(PContainer.displayName, 'ComponentContainer', 'Container should have Component\'s name with suffix');
	});

	it('should raise an error if no components are specified', () => {
		assert.throws(() => Container.create({success: null}, {}), /Success, Failure and Pending should be React components/);
		assert.throws(() => Container.create({}, {}), /Success component should be specified/);
	});

	it('should render Pending component by default', () => {
		const Spinner = () => <p>Loading...</p>;
		const PContainer = Container.create({success: Component, pending: Spinner}, {});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<PContainer />);

		assert.ok(TestUtils.isElementOfType(ReactShallow.getRenderOutput(), Spinner), 'Pending component should be rendered');
	});

	it('should render Success component with data fetched from fragments', (done) => {
		const PContainer = Container.create(Component, {
			fragments: {
				thing() {
					return new Promise((resolve) => {
						setTimeout(resolve, FIRST_ACTION_TIMEOUT, VALUE);
					});
				}
			}
		});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<PContainer />);

		setTimeout(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(TestUtils.isElementOfType(Output, Component), 'Success component should be rendered');
			assert.deepEqual(Output.props, { thing: VALUE }, 'Component should be rendered with data fetched via fragments');
			done();
		}, SECOND_ACTION_TIMEOUT);
	});

	// waiting for https://github.com/facebook/react/pull/5247 being merged
	xit('should immediately render Success component if fragments are passed via props', () => {
		const PContainer = Container.create(Component, {
			fragments: {
				thing() {
					return new Promise((resolve) => {
						setTimeout(resolve, FIRST_ACTION_TIMEOUT, VALUE);
					});
				}
			}
		});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<PContainer thing={VALUE} />);

		const Output = ReactShallow.getRenderOutput();

		// TODO: check fragment that should not be called
		assert.ok(TestUtils.isElementOfType(Output, Component), 'Success component should be rendered');
		assert.deepEqual(Output.props, { thing: VALUE }, 'Component should be rendered with data fetched via fragments');
	});

	// should fail for incorrect prop types
	// should immediately render Success component if fragments are passed via props
	// should call fragments with passed variables
	// should use initial variables if actual are not specified
	// should dispose subscriptions after unmount
	// should actually works with promises, stores and simple observables
	// should handle failed streams and render Failure element
	// should render `null` for not specified components
});
