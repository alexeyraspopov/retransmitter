import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Transmitter from './index';
import assert from 'assert';

function log(target) {
	console.log(require('util').inspect(target, { depth: 3, showHidden: true }));
}

function runAsync(block) {
	return new Promise(resolve => setTimeout(async () => resolve(await block()), 10));
}

describe('AsyncComponent', () => {
	const Component = props => <div />;

	it('should create React component', () => {
		const ComponentFetch = async props => {
			await Promise.resolve(13);
			return <Component />;
		};

		const Container = Transmitter.AsyncComponent(ComponentFetch);

		assert.ok(TestUtils.isElement(<Container />), 'Container should be a React component');
		assert.equal(Container.displayName, 'Transmitter(ComponentFetch)', 'Container should have Component\'s name with prefix');
	});

	it('should render original component with resolved data', () => {
		const ComponentFetch = async props => {
			const data = await Promise.resolve(13);
			return <Component data={data} />;
		};

		const Container = Transmitter.AsyncComponent(ComponentFetch);
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

		const Container = Transmitter.AsyncComponent(ComponentFetch);
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

		const Container = Transmitter.AsyncComponent(ComponentFetch);
		const ReactShallow = TestUtils.createRenderer();

		ReactShallow.render(<Container />);

		return runAsync(() => {
			const Output = ReactShallow.getRenderOutput();
			assert.ok(TestUtils.isElementOfType(Output, ErrorMessage), 'AsyncComponent should work with failure state of async function');
		});
	});
});

describe('Transmitter.Container', () => {

});

describe('Transmitter.create', () => {

});
