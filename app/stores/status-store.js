// created by @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/app/stores/status-store.js
import alt from 'utils/alt';
import axios from 'axios';
import StatusActions from 'actions/status-actions';

class StatusStore {
  constructor() {
    this.bindActions(StatusActions);
    this.busy = false;
    this.error = false;
    this.queue = [];
  }
  onStarted(resource) {
    if(resource && this.queue.indexOf(resource) < 0) {
      this.queue.push(resource);
    }
    this.busy = true;
    this.error = false;
  }
  onDone(resource) {
    if(resource) {
      this.queue.splice(this.queue.indexOf(resource), 1);
    }
    this.busy = false;
    this.error = false;
  }
  onFailed(retryData) {
    this.busy = false;
    this.error = true;
    this.retryData = retryData;
  }
  async onRetry() {
    const response = await axios(this.retryData.config);
    var data = response.data;
    alt.dispatch(this.retryData.action.symbol, data, this.retryData.action);
    StatusActions.done();
  }
}

module.exports = (alt.createStore(StatusStore));

