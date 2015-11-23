import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Transmitter from './index';
import assert from 'assert';

function log(target) {
	console.log(require('util').inspect(target, { depth: 3, showHidden: true }));
}

function runAsync(block) {
	return new Promise(resolve => setTimeout(() => resolve(block()), 10));
}

describe('AsyncComponent', () => {
	const Component = props => <div />;

	it('should create React component', () => {
		const ComponentFetch = async props => {
			await Promise.resolve(13);
			return <Component />;
		};

		const Container = Transmitter.wrap(ComponentFetch);

		assert.ok(TestUtils.isElement(<Container />), 'Container should be a React component');
		assert.equal(Container.displayName, 'Transmitter(ComponentFetch)', 'Container should have Component\'s name with prefix');
	});

	it('should render original component with resolved data', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(13);
			return <Component data={data} />;
		};

		const Container = Transmitter.wrap(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();

			assert.ok(TestUtils.isElementOfType(Output, Component), 'Success component should be rendered');
			assert.deepEqual(Output.props, {data: 13}, 'Component should be rendered with data fetched via fragments');
		});
	});
});

describe('Transmitter.Container', () => {

});

describe('Transmitter.create', () => {

});
