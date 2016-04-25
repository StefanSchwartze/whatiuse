import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';

class ExamplesActions {
  constructor() {
    this.generateActions('removeCurrent');
  }
  fetch() {
    networkAction(this, api.examples.getAll);
  }
  get(id) {
    networkAction(this, api.examples.get, id);
  }
  add(data) {
    networkAction(this, api.examples.post, clone(data));
  }
  update(id, data) {
    networkAction(this, api.examples.put, id, clone(data));
  }
  delete(id) {
    networkAction(this, api.examples.delete, id);
  }
}

module.exports = (alt.createActions(ExamplesActions));
