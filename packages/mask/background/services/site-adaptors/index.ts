export {
    getSupportedSites,
    getSupportedOrigins,
    getOriginsWithoutPermission,
    getSitesWithoutPermission,
    getAllOrigins,
    requestPermissionBySite,
    setupSite,
    connectSite,
    disconnectSite,
} from './connect.js'
export { attachMaskSDKToCurrentActivePage, shouldSuggestConnectInPopup } from './sdk.js'
