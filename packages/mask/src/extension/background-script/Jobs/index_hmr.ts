import * as IsolatedDashboardBridge from './IsolatedDashboardBridge'
import * as InjectContentScripts from './InjectContentScripts'
import * as PluginWorker from './StartPluginWorker'
import * as SettingListeners from './SettingListeners'
import { CleanProfileAndAvatar, NewInstalled } from '@masknet/background-service'

type CancelableJob = { default: (signal: AbortSignal) => void }
const CancelableJobs: CancelableJob[] = [
    InjectContentScripts,
    NewInstalled,
    IsolatedDashboardBridge,
    PluginWorker,
    SettingListeners,
    CleanProfileAndAvatar,
]

const abort = new AbortController()
CancelableJobs.map((x) => x.default(abort.signal))
if (import.meta.webpackHot) {
    import.meta.webpackHot.dispose(() => abort.abort())
    import.meta.webpackHot.accept()
}
