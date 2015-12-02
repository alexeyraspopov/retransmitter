// simple async component
// TODO: can I use react-motion for making conditional spinner?
Transmitter.AsyncComponent(UserInfoContainer);
async function UserInfoContainer({userId}) {
	const user = await User.find({id: userId});

	return <UserInfo user={user} />;
}

// transmitter container class
class UsersListContainer extends Transmitter.Container {
	observe() {
		return {
			query: Transmitter.fromStore(QueryStore),
			users: Users.all(),
		};
	}

	// TODO: what strategy will be better: separate methods or `render` with switch/case?
	renderPending() {
		const {onAbort} = this.state;
	}

	renderFailure() {
		const {onRetry, error} = this.state;
	}

	render() {
		return <UsersList users={this.state.users} query={this.state.query} />;
	}
}

// transmitter container api
Transmitter.create({
	observe() {},
	renderPending() {},
	renderFailure() {},
	render() {},
});
