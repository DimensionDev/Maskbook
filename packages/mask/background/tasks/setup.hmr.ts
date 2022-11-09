import './Cancellable/NewInstalled.js'
import './Cancellable/InjectContentScripts.js'
import './Cancellable/InjectContentScripts-mv3.js'
import './Cancellable/IsolatedDashboardBridge.js'
import './Cancellable/CleanProfileAndAvatar.js'
import './Cancellable/NotificationsToMobile.js'
import './Cancellable/PopupSSR/index.js'
import './Cancellable/PopupSSR/index.mv3.js'
import './Cancellable/SettingsListener.js'
import './Cancellable/StartPluginHost.js'
import './Cancellable/StartSandboxedPluginHost.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
