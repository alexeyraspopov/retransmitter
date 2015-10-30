import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Container from './index';
import assert from 'assert';

describe('Container', () => {
	// TODO: describe use cases
	const Component = (props) => <div />;

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

	it('should render Pending element by default', () => {
		const Spinner = () => <p>Loading...</p>;
		const PContainer = Container.create({success: Component, pending: Spinner}, {});
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<PContainer />);

		assert.ok(TestUtils.isElementOfType(ReactShallow.getRenderOutput(), Spinner), 'Pending component should be rendered');
	});

	// should render Success element if fragments were passed via props
	// should dispose subscriptions after unmount
	// should actually works with promises, stores and simple observables
	// should handle failed streams and render Failure element
});
