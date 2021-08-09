import * as SDK from './sdk'
const hmrSDK = { ...SDK }
export default hmrSDK
if (module.hot) {
    module.hot.accept('./sdk', async () => {
        Object.assign(hmrSDK, await import('./sdk'))
    })
}
