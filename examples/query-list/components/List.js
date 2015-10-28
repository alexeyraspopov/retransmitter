import React from 'react';
import Item from 'components/Item';

export default function List({items, query = ''}) {
	const isQueried = ({title}) => title.toLowerCase().includes(query.toLowerCase());
	const item = ({id, title, description}) => <Item key={id} title={title} description={description} />;

	return (
		<section>
			{items.filter(isQueried).map(item)}
		</section>
	);
}
