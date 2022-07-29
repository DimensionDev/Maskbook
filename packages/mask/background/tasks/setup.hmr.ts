import './Cancellable/NewInstalled'
import './Cancellable/InjectContentScripts'
import './Cancellable/InjectContentScripts-mv3'
import './Cancellable/IsolatedDashboardBridge'
import './Cancellable/CleanProfileAndAvatar'
import './Cancellable/NotificationsToMobile'
import './Cancellable/PopupSSR'
import './Cancellable/PopupSSR/index.mv3'
import './Cancellable/SettingsListener'
import './Cancellable/StartPluginHost'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
