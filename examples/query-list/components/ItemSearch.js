import React from 'react';

export default function ItemSearch({query, onChange}) {
	return <input type="text" placeholder="Search items..." value={query} onChange={onChange} />;
}
