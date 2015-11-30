# Async Component

***Warning***: this API is *experimental*. Use at your own risk.

Starting from React [v0.14](http://facebook.github.io/react/blog/2015/10/07/react-v0.14.html) you're able to describe stateless components as [plain functions](http://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components):

```javascript
function UserInfo({user}) {
	return (
		<article>
			<p>{user.name}</p>
			<p>{user.isOnline}</p>
		</article>
	);
}
```

And use them as typical React component:

```javascript
ReactDOM.render(<UserInfo user={...} />, ...);
```
