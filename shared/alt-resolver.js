const { BROWSER, NODE_ENV } = process.env

class AltResolver {

  firstRender = true
  pendingActions = []

  resolve(action, setImmediate = (NODE_ENV === 'test')) {
    if ((BROWSER && !this.firstRender) || setImmediate) {
      action()
    } else {
      console.log('add to array')
      this.pendingActions = [ ...this.pendingActions, action ]
    }
  }

  async dispatchPendingActions() {
    for (const action of this.pendingActions) {
      await action()
    }
  }

}

export default AltResolver
