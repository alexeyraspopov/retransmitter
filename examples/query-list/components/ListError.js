import React from 'react';

export default function ListError({error, onRetry}) {
	return (
		<article>
			<p>Oops... Something went wrong. Click <a href="#" onClick={onRetry}>here</a> to retry</p>
		</article>
	)
}
