import {createStore as Store} from 'redux';

export default Store(QueryState);

function QueryState(query = '', action) {
	switch (action.type) {
	case 'QUERY_CHANGED':
		return action.query;
	default:
		return query;
	}
}
