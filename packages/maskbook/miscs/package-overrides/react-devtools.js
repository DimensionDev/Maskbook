// we don't import 'react-devtools' cause it needs to download electron
import { connectToDevTools } from 'react-devtools-core/backend'
try {
    connectToDevTools({
        useHttps: false,
        retryConnectionDelay: 10000,
    })
} catch (e) {}
