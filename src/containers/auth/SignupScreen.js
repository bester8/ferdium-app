import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import Signup from '../../components/auth/Signup';
import UserStore from '../../stores/UserStore';
import { gaPage } from '../../lib/analytics';

import { globalError as globalErrorPropType } from '../../prop-types';

@inject('stores', 'actions') @observer
export default class SignupScreen extends Component {
  static propTypes = {
    error: globalErrorPropType.isRequired,
  };

  componentDidMount() {
    gaPage('Auth/Signup');
  }

  render() {
    const { actions, stores, error } = this.props;
    return (
      <Signup
        onSubmit={actions.user.signup}
        isSubmitting={stores.user.signupRequest.isExecuting}
        loginRoute={stores.user.loginRoute}
        error={error}
      />
    );
  }
}

SignupScreen.wrappedComponent.propTypes = {
  actions: PropTypes.shape({
    user: PropTypes.shape({
      signup: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  stores: PropTypes.shape({
    user: PropTypes.instanceOf(UserStore).isRequired,
  }).isRequired,
};
