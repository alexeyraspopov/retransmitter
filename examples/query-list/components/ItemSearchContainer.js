import ItemSearch from 'components/ItemSearch';
import Transmitter from '../../../index';
import QueryStore from 'stores/QueryStore';
import * as QueryActions from 'actions/QueryActions';

export default Transmitter.create(ItemSearch, {
	fragments: {
		query() {
			return Transmitter.fromStore(QueryStore);
		},
		onChange() {
			return event => QueryStore.dispatch(QueryActions.updateQuery(event.target.value));
		}
	}
});
