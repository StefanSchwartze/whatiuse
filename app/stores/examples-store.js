import alt from 'utils/alt';
import {assign} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import ExamplesActions from 'actions/examples-actions';

class ExamplesStore {
  constructor() {
    this.bindActions(ExamplesActions);
    this.examples = [];
    this.examplesHash = {};
    this.currentExample = null;
  }
  onAdd(item) {
    this.examples.push(item);
  }
  onFetch(examples) {
    this.examples = examples;
    this.examplesHash = this.examples.reduce((hash, item) => {
      hash[item._id] = item;
      return hash;
    }, {});
  }
  onGet(example) {
    this.currentExample = example;
  }
  onUpdate(item) {
    assign(findItemById(this.examples, item._id), item);
  }
  onDelete(item) {
    this.examples.splice(findIndexById(this.examples, item._id), 1);
  }
  onRemoveCurrent() {
    this.currentExample = null;
  }

}

module.exports = (alt.createStore(ExamplesStore));
