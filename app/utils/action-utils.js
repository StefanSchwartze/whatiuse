// forked from @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/app/utils/action-utils.js
import {isFunction} from 'lodash';
import alt from 'utils/alt';
import StatusActions from 'actions/status-actions';
import LoginActions from 'actions/login-actions';

export default {
  networkAction: async (resource = "", dispatch, context, method, ...params) => {
    try {
      StatusActions.started(resource);
      const response = await method.apply(context, params);
      const data = isFunction(response) ? response().data : response.data;
      dispatch(data);
      StatusActions.done(resource);
    } catch (err) {
      if (err.status === 401 && process.env.BROWSER) {
        LoginActions.logout();
      }
      else {
        StatusActions.failed({config: err.config, action: context.actionDetails});
      }
    }
  }
};
