import * as AutoShareToFriends from './AutoShareToFriends'
import * as IsolatedDashboardBridge from './IsolatedDashboardBridge'
import * as InjectContentScripts from './InjectContentScripts'
import * as NewInstalled from './NewInstalled'
import * as PluginWorker from './StartPluginWorker'
import * as SettingListeners from './SettingListeners'

type CancelableJob = { default: (signal: AbortSignal) => void }
const CancelableJobs: CancelableJob[] = [
    InjectContentScripts,
    NewInstalled,
    AutoShareToFriends,
    IsolatedDashboardBridge,
    PluginWorker,
    SettingListeners,
]

const abort = new AbortController()
CancelableJobs.map((x) => x.default(abort.signal))
if (import.meta.webpackHot) {
    import.meta.webpackHot.dispose(() => abort.abort())
    import.meta.webpackHot.accept()
}
