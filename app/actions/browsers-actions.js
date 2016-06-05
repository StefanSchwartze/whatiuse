import alt from 'utils/alt';
import api from 'utils/api';
import {clone, assign, map} from 'lodash';
import {findItemById} from 'utils/store-utils';

import axios from 'axios';
import StatusActions from 'actions/status-actions';

class BrowsersActions {
    constructor() {

    }
    selectScope(scope) {
        return scope;
    }
}

module.exports = (alt.createActions(BrowsersActions));
