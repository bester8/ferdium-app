import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';

import ServicesStore from '../../stores/ServicesStore';

import Layout from '../../components/settings/SettingsLayout';
import Navigation from '../../components/settings/navigation/SettingsNavigation';

@inject('stores', 'actions') @observer
export default class SettingsContainer extends Component {
  render() {
    const { children, stores } = this.props;
    const { closeSettings } = this.props.actions.ui;

    const navigation = (
      <Navigation
        serviceCount={stores.services.all.length}
      />
    );

    return (
      <Layout
        navigation={navigation}
        closeSettings={closeSettings}
      >
        {children}
      </Layout>
    );
  }
}

SettingsContainer.wrappedComponent.propTypes = {
  children: PropTypes.element.isRequired,
  stores: PropTypes.shape({
    services: PropTypes.instanceOf(ServicesStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    ui: PropTypes.shape({
      closeSettings: PropTypes.func.isRequired,
    }),
  }).isRequired,
};
