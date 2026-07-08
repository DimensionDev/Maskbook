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
export { getTelemetryID, setTelemetryID } from './telemetry-id.js'
export { getActiveTab } from './tabs.js'
export { requestXOAuthToken, resolveXOAuth, resetXOAuth } from './oauth-x.js'
export { loginFireflyViaTwitter } from './firefly.js'
export {
    encrypt,
    getDesktopSyncLinkInfo,
    getSyncChannelStatus,
    confirmSyncChannel,
    syncTwitterCookies,
    getTwitterOAuthData,
    type DesktopLinkInfoResponse,
    type SyncChannelStatusResponse,
    type TwitterCookiesPayload,
    type SocialAccountTwitter,
    type TwitterOAuthData,
    type ConfirmSyncChannelOperation,
} from './firefly.js'
export { getXOAuthToken } from './oauth-x.js'
