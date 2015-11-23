// simple async component
Transmitter.wrap(UserInfoContainer);
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

	render() {
		return <UsersList users={this.state.users} query={this.state.query} />;
	}
}

// transmitter container api
Transmitter.create({
	observe() {},
	render() {},
});

// Transmitter container for rich elements
Transmitter.adapter({
	pending: LoadingSpinner,
	success: DataComponent,
	failure: ErrorMessage,
});
