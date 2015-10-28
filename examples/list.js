import React from 'react';
import ReactDOM from 'react-dom';
import Container from '../index';

const ListContainer = Container({
	pending: LoadingSpinner,
	success: List,
	failure: ListError,
}, {
	fragments: {
		items({id}) {
			return Math.random() > 0.5 ? Promise.resolve([
				{id: 'a', title: 'Hello', description: 'Article #1'},
				{id: 'b', title: 'Hola', description: 'Article #2'},
				{id: 'c', title: 'Привет', description: 'Article #3'},
			]) : Promise.reject(new Error('Something happened'));
		}
	}
});

ReactDOM.render(<ListContainer />, document.querySelector('main'));

function Item({title, description}) {
	return (
		<article>
			<h2>{title}</h2>
			<p>{description}</p>
		</article>
	);
}

function List({items}) {
	return (
		<section>
			{items.map(({id, title, description}) =>
				<Item key={id} title={title} description={description} />
			)}
		</section>
	);
}

function LoadingSpinner() {
	return <p>Loading...</p>;
}

function ListError({error, onRetry}) {
	return (
		<article>
			<p>Oops... Something went wrong. Click <a href="#" onClick={onRetry}>here</a> to retry</p>
		</article>
	)
}
