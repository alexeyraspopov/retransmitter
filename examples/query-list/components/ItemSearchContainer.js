import React from 'react';
import {Provider, connect as Connect} from 'react-redux';
import ItemSearch from 'components/ItemSearch';
import QueryStore from 'stores/QueryStore';
import * as QueryActions from 'actions/QueryActions';

const ItemSearchConnect = Connect(query => ({
	query,
	onChange: event => QueryStore.dispatch(QueryActions.changeQuery(event.target.value))
}))(ItemSearch);

export default function ItemSearchContainer() {
	return (
		<Provider store={QueryStore}>
			<ItemSearchConnect />
		</Provider>
	);
}
