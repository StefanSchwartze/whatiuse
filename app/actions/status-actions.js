// created by @tomaash
// source: https://github.com/tomaash/react-example-filmdb/blob/master/app/actions/status-actions.js
import alt from 'utils/alt';

class StatusActions {
    constructor() {
        this.generateActions('started', 'done', 'failed', 'retry');
    }
}

module.exports = (alt.createActions(StatusActions));
