import React from 'react';
import ReactDOM from 'react-dom';
import ItemSearchContainer from 'components/ItemSearchContainer';
import ListContainer from 'components/ListContainer';

ReactDOM.render(<App />, document.querySelector('main'));

function App() {
	return (
		<div>
			<ItemSearchContainer />
			<ListContainer />
		</div>
	);
}
