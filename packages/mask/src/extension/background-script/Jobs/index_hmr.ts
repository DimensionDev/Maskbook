import * as IsolatedDashboardBridge from './IsolatedDashboardBridge'
import * as InjectContentScripts from './InjectContentScripts'
import * as NewInstalled from '../../../../background/tasks/NewInstalled'
import * as PluginWorker from './StartPluginWorker'
import * as SettingListeners from './SettingListeners'
import * as CleanupProfileDatabase from '../../../../background/tasks/CleanProfileAndAvatar'
import * as NotificationsToMobile from '../../../../background/tasks/NotificationsToMobile'

type CancelableJob = { default: (signal: AbortSignal) => void }
const CancelableJobs: CancelableJob[] = [
    InjectContentScripts,
    NewInstalled,
    IsolatedDashboardBridge,
    PluginWorker,
    SettingListeners,
    CleanupProfileDatabase,
    NotificationsToMobile,
]

const abort = new AbortController()
CancelableJobs.map((x) => x.default(abort.signal))
if (import.meta.webpackHot) {
    import.meta.webpackHot.dispose(() => abort.abort())
    import.meta.webpackHot.accept()
}
