import * as AutoShareToFriends from './AutoShareToFriends'
import * as IsolatedDashboardBridge from './IsolatedDashboardBridge'
import * as InjectContentScripts from './InjectContentScripts'
import * as NewInstalled from './NewInstalled'
import * as PluginWorker from './StartPluginWorker'
import * as SettingListeners from './SettingListeners'

type CancelableJob = { default: () => () => void }
const CancelableJobs: CancelableJob[] = [
    InjectContentScripts,
    NewInstalled,
    AutoShareToFriends,
    IsolatedDashboardBridge,
    PluginWorker,
    SettingListeners,
]

if (import.meta.webpackHot) {
    const cleanup = CancelableJobs.map(startJob)
    import.meta.webpackHot.dispose(() => cleanup.forEach((x) => x()))
    import.meta.webpackHot.accept()
} else {
    CancelableJobs.forEach(startJob)
}
function startJob(x: CancelableJob) {
    return x.default()
}
