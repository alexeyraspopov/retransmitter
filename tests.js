import React from 'react';
import Container from './index';
import assert from 'assert';

describe('Container', () => {
	// TODO: describe use cases
	const Component = (props) => <div />;

	it('should create React component', () => {
		const PContainer = Container(Component, {});

		assert.ok(React.isValidElement(<PContainer />), 'Container should be a React component');
		assert.equal(PContainer.displayName, 'ComponentContainer', 'Container should have Component\'s name with suffix');
	});
});
