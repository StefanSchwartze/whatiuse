import React from 'react';
import AltContainer from 'alt-container';
import ExamplesList from './examples-list';

import ExamplesStore from 'stores/examples-store';
import {authDecorator} from 'utils/component-utils';

import connectToStores from 'alt-utils/lib/connectToStores';

@authDecorator
export default class Examples extends React.Component {
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