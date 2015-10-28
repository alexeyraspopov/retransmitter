import React from 'react';

export default function ItemSearch({query, onChange}) {
	return <input type="text" value={query} onChange={onChange} />;
}
