/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import './prepare'
import ReactDOM from 'react-dom'
import { setService, WebExtensionExternalChannel } from './API'
import { App } from './App'
import { AsyncCall } from 'async-call-rpc'
import { serializer } from '@dimensiondev/maskbook-shared'
import { StylesProvider } from '@material-ui/core/styles'

setService(
    new Proxy({} as any, {
        get(target, prop) {
            if (target[prop]) return target[prop]
            target[prop] = AsyncCall(
                {},
                { channel: new WebExtensionExternalChannel(String(prop)), serializer, log: 'all' },
            )
            return target[prop]
        },
    }),
)

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(
    <StylesProvider injectFirst>
        <App />
    </StylesProvider>,
)

if (!import.meta.hot) {
    throw new Error('This app is not used to run as an isolated web site currently')
} else {
    import.meta.hot.accept()
}
