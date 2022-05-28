export { fetch, fetchJSON } from './fetch'
export { resolveTCOLink } from './short-link-resolver'
export { openPopupWindow, removePopupWindow, openDashboard } from './popup-opener'
export { __deprecated__getStorage, __deprecated__setStorage } from './deprecated-storage'
export { queryExtensionPermission, requestExtensionPermission } from './request-permission'
export { saveFileFromBuffer, type SaveFileOptions } from '../../../shared/helpers/download'
export {
    queryExistedBindingByPersona,
    queryExistedBindingByPlatform,
    bindProof,
    createPersonaPayload,
    queryIsBound,
} from './providers'
