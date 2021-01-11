import * as AutoShareToFriends from './AutoShareToFriends'
import * as IsolatedDashboardBridge from './IsolatedDashboardBridge'
import * as InjectContentScripts from './InjectContentScripts'
import * as NewInstalled from './NewInstalled'

type CancelableJob = { default: () => () => void }
const CancelableJobs: CancelableJob[] = [
    InjectContentScripts,
    NewInstalled,
    AutoShareToFriends,
    IsolatedDashboardBridge,
]

if (module.hot) {
    const cleanup = CancelableJobs.map(startJob)
    module.hot.dispose(() => cleanup.forEach((x) => x()))
    module.hot.accept()
} else {
    CancelableJobs.forEach(startJob)
}
function startJob(x: CancelableJob) {
    return x.default()
}
