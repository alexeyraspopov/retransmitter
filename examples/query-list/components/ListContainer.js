import React from 'react';
import ListPending from 'components/ListPending';
import ListError from 'components/ListError';
import List from 'components/List';
import Container from '../../../index';

export default Container({
	pending: ListPending,
	success: List,
	failure: ListError,
}, {
	fragments: {
		items({id}) {
			const seed = [
				{id: 'a', title: 'Hello', description: 'Article #1'},
				{id: 'b', title: 'Hola', description: 'Article #2'},
				{id: 'c', title: 'Привет', description: 'Article #3'},
			];

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					Math.random() > 0.5 ? resolve(seed) : reject(new Error('Something happened'));
				}, 1000);
			});
		},
		query() {
			return Promise.resolve('l');
		}
	}
});
