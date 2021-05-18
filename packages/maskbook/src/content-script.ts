import './extension/content-script/hmr'
import { status } from './setup.ui'

status.then((loaded) => {
    loaded && import('./extension/content-script/tasks')
})
