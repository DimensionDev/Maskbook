export { fetchBlob, fetchJSON, fetchText, fetchGlobal } from '@masknet/web3-providers/helpers'
export { resolveTCOLink } from './short-link-resolver.js'
export {
    openPopupWindow,
    removePopupWindow,
    openDashboard,
    queryCurrentActiveTab,
    hasPopupWindowOpened,
} from './popup-opener.js'
export {
    queryExtensionPermission,
    hasHostPermission,
    requestExtensionPermissionFromContentScript,
} from './request-permission.js'
export { queryRemoteI18NBundle, type Bundle } from './i18n-cache-query.js'
export { getTelemetryID, setTelemetryID } from './telemetry-id.js'
export { fetchSandboxedPluginManifest } from './sandboxed.js'
export { getActiveTab } from './tabs.js'
