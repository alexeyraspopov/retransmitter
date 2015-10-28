import React from 'react';
import ListPending from 'components/ListPending';
import ListError from 'components/ListError';
import List from 'components/List';
import Container from '../../../index';
import * as ItemsAPI from 'api/ItemsAPI';

export default Container({
	pending: ListPending,
	success: List,
	failure: ListError,
}, {
	fragments: {
		items({id}) {
			return ItemsAPI.fetchItems();
		},
		query() {
			return Promise.resolve('l');
		}
	}
});
