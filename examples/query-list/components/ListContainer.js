import React from 'react';
import ListPending from 'components/ListPending';
import ListError from 'components/ListError';
import List from 'components/List';
import Container from '../../../index';
import QueryStore from 'stores/QueryStore';
import * as ItemsAPI from 'api/ItemsAPI';

export default Container.create({
	pending: ListPending,
	success: List,
	failure: ListError,
}, {
	fragments: {
		items() {
			return ItemsAPI.fetchItems();
		},
		query() {
			return Container.fromStore(QueryStore);
		}
	}
});
