export { getDesignatedAutoStartPluginID, openSiteAndActivatePlugin } from './open-with-plugin.js'
export {
    getSupportedSites,
    getSupportedOrigins,
    getOriginsWithoutPermission,
    getSitesWithoutPermission,
    getOriginsWithPermission,
    requestPermissionBySite,
    hasSetup,
    setupSite,
    connectSite,
} from './connect.js'
export { openProfilePage, openShareLink } from './open-page.js'
export { attachMaskSDKToCurrentActivePage, shouldSuggestConnectInPopup } from './sdk.js'
