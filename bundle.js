'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = Container;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function Container(Component, options) {
	// fragments can return Promise, Observer, Subscription
	// Promise :: { then }
	// Observer :: { subscribe -> unsubscribe }
	// Subscription :: { getState, subscribe -> { dispose } }
	var _options$fragments = options.fragments;
	var fragments = _options$fragments === undefined ? {} : _options$fragments;
	var _options$shouldContainerUpdate = options.shouldContainerUpdate;
	var shouldContainerUpdate = _options$shouldContainerUpdate === undefined ? function () {
		return true;
	} : _options$shouldContainerUpdate;
	var _options$initialVariables = options.initialVariables;
	var initialVariables = _options$initialVariables === undefined ? {} : _options$initialVariables;

	var componentPropTypes = Component.propTypes || {};

	return _react2['default'].createClass({
		displayName: (Component.displayName || Component.name) + 'Container',

		propTypes: {
			variables: _react.PropTypes.object
		},

		componentWillMount: function componentWillMount() {
			var _this = this;

			var variables = (0, _objectAssign2['default'])({}, initialVariables, this.props.variables);

			var promises = Object.keys(fragments).map(function (key) {
				return fragments[key](variables).then(function (data) {
					return _defineProperty({}, key, data);
				});
			});

			Promise.all(promises).then(function (fetchedFragments) {
				var state = fetchedFragments.reduce(binary(_objectAssign2['default']), {});

				_this.setState(state);
			});
		},

		componentWillUnmount: function componentWillUnmount() {
			// dispose
		},

		componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
			if (shouldContainerUpdate.call(this, nextProps)) {
				// update
			}
		},

		render: function render() {
			var children = this.props.children;

			// TODO: pass other props
			return _react2['default'].createElement(Component, { children: children });
		}
	});
}

function binary(fn) {
	return function (a, b) {
		return fn(a, b);
	};
}
module.exports = exports['default'];

