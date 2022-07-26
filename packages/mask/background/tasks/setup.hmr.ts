import * as NewInstalled from './Cancellable/NewInstalled'
import * as InjectContentScript from './Cancellable/InjectContentScripts'
import * as InjectContentScriptMV3 from './Cancellable/InjectContentScripts-mv3'
import * as IsolatedDashboardBridge from './Cancellable/IsolatedDashboardBridge'
import * as CleanupProfileDatabase from './Cancellable/CleanProfileAndAvatar'
import * as NotificationsToMobile from './Cancellable/NotificationsToMobile'
import * as PopupSSR from './Cancellable/PopupSSR'
import * as PopupSSR_MV3 from './Cancellable/PopupSSR/index.mv3'
import * as SettingsListener from './Cancellable/SettingsListener'

type CancelableJob = { default: (signal: AbortSignal) => void }
const CancelableJobs: CancelableJob[] = [
    NewInstalled,
    process.env.manifest === '2' ? InjectContentScript : InjectContentScriptMV3,
    IsolatedDashboardBridge,
    NotificationsToMobile,
    SettingsListener,
]

if (process.env.architecture === 'web') {
    CancelableJobs.push(
        // Web only
        process.env.manifest === '2' ? PopupSSR : PopupSSR_MV3,
        CleanupProfileDatabase,
    )
}

const abort = new AbortController()
CancelableJobs.forEach((task) => task.default(abort.signal))
if (import.meta.webpackHot) {
    import.meta.webpackHot.dispose(() => abort.abort())
    import.meta.webpackHot.accept()
}
