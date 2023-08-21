import { fetchGlobal } from '@masknet/web3-providers/helpers'

export { fetchBlob, fetchJSON, fetchText, fetchGlobal } from '@masknet/web3-providers/helpers'
export { resolveTCOLink } from './short-link-resolver.js'
export {
    openPopupWindow,
    removePopupWindow,
    openDashboard,
    queryCurrentActiveTab,
    openWalletStartUpWindow,
    queryCurrentPopupWindowId,
} from './popup-opener.js'
export {
    queryExtensionPermission,
    requestExtensionPermission,
    hasHostPermission,
    requestHostPermission,
} from './request-permission.js'
export { queryRemoteI18NBundle, type Bundle } from './i18n-cache-query.js'
export { getTelemetryID, setTelemetryID } from './telemetry-id.js'
Reflect.set(globalThis, 'fetch', fetchGlobal)
