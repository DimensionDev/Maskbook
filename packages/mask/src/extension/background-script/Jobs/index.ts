import './index_hmr'
import '../../../../background/tasks/setup.hmr'
// Add and execute your non-cancelable jobs here. It won't compatible to HMR.
import '../../../../background/tasks/NotCancellable/PrintBuildFlags'
import '../../../../background/tasks/NotCancellable/DatabaseCleanup/DropOldDatabase'
