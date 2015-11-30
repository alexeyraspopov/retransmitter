# Async Component

***Warning***: this API is *experimental*. Use at your own risk.

Starting from React [v0.14](http://facebook.github.io/react/blog/2015/10/07/react-v0.14.html) you're able to describe stateless components as [plain functions](http://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components):

```javascript
function UserInfo({user}) {
	return (
		<article>
			<p>{user.name}</p>
			<p><em>{user.isOnline && 'Online'}</em></p>
		</article>
	);
}
```

And use them as typical React component:

```javascript
const user = { name: 'Ann', isOnline: true };

ReactDOM.render(<UserInfo user={user} />, ...);
```

These functions are written in interactive (pull-based) approach. The only one place where these functions are getting their data to show is **props**. If we start development from the smallest component (that doesn't have any other React components as a children) we will continue with creating more specific components that will "prepare" props for their child React components. That's a simple idea of **composition**.

```javascript
function UserList({users}) {
	return (
		<section>
			{users.map(user => <UserInfo user={user} />)}
		</section>
	);
}
```

At some level we have to get data outside of the UI, and probably from different sources. It can be Flux stores, REST API, client-side storage (Local Storage, IndexedDB, etc), any other Web API.

Let's keep in mind that we should describe data requirements close to the place where they are needed.