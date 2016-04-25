import React from 'react';
import AltContainer from 'alt/AltContainer';
import ExamplesList from './examples-list';

import ExamplesStore from 'stores/examples-store';
import {authDecorator} from 'utils/component-utils';

import connectToStores from 'alt/utils/connectToStores';

@authDecorator
export default class Projects extends React.Component {
  static willTransitionTo(transition) {
    console.log(transition);
  }
  render() {
    return (
      <AltContainer
        stores={{
          ExamplesStore: ExamplesStore
        }}>
        <div className="content-container content">
          <ExamplesList />
        </div>
      </AltContainer>
    );
  }
}