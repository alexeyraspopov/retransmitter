import {Component} from 'react';

export default class Container extends Component {

}

/*
class UserInfoContainer extends Transmitter.Container {
	observe({userId}) {
		return {
			user: fetch(`/users/${userId}`),
		};
	}

	render() {
		return <UserInfo user={this.state.user} />;
	}
}
*/

/*
class TodoListContainer extends Transmitter.Container {
	observe() {
		return {
			todos: fetch('/todos'),
			query: Transmitter.fromStore(QueryStore),
		};
	}

	render() {
		return <TodoList todos={this.state.todos} query={this.state.query} />
	}
}
*/
