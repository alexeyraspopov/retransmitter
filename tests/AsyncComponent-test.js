import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import AsyncComponent from './src/AsyncComponent';
import assert from 'assert';
import sinon from 'sinon';

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
	function Component() {
		return <div />;
	}
});
