export function fetchItems() {
	const seed = [
		{id: 'a', title: 'Hello', description: 'Article #1'},
		{id: 'b', title: 'Hola', description: 'Article #2'},
		{id: 'c', title: 'Привет', description: 'Article #3'},
	];

	return new Promise((resolve, reject) => {
		setTimeout(() => {
			Math.random() > 0.5 ? resolve(seed) : reject(new Error('Something happened'));
		}, 1000);
	});
}
