import Redux from 'redux';

export default Redux.createStore(QueryState);

function QueryState(query = '', action) {
	switch (action.type) {
	case 'QUERY_UPDATED':
		return action.query;
	default:
		return query;
	}
}
