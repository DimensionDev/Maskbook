import * as NewInstalled from './Cancellable/NewInstalled'
import * as InjectContentScript from './Cancellable/InjectContentScripts'
import * as IsolatedDashboardBridge from './Cancellable/IsolatedDashboardBridge'
import * as CleanupProfileDatabase from './Cancellable/CleanProfileAndAvatar'

type CancelableJob = { default: (signal: AbortSignal) => void }
const CancelableJobs: CancelableJob[] = [
    NewInstalled,
    InjectContentScript,
    IsolatedDashboardBridge,
    CleanupProfileDatabase,
]

const abort = new AbortController()
CancelableJobs.forEach((task) => task.default(abort.signal))
if (import.meta.webpackHot) {
    import.meta.webpackHot.dispose(() => abort.abort())
    import.meta.webpackHot.accept()
}
