export { createPersonaByPrivateKey, mobile_restoreFromMnemonicWords } from './persona/create'
export { mobile_queryPersonaRecordsFromIndexedDB } from './persona/query'
export {
    deletePersona,
    logoutPersona,
    setupPersona,
    loginExistPersonaByPrivateKey,
    mobile_queryPersonaByPrivateKey,
} from './persona/update'
export { signWithPersona, type SignRequest, type SignRequestResult, generateSignResult } from './persona/sign'
export { exportPersonaMnemonicWords, exportPersonaPrivateKey } from './persona/backup'

export { mobile_queryProfiles, mobile_queryProfileRecordFromIndexedDB } from './profile/query'
export {
    updateProfileInfo,
    type UpdateProfileInfo,
    mobile_removeProfile,
    detachProfileWithNextID,
    resolveUnknownLegacyIdentity,
    attachProfile,
    detachProfile,
} from './profile/update'

export { createNewRelation } from './relation/create'
export { mobile_queryRelationsRecordFromIndexedDB } from './relation/query'
export { updateRelation } from './relation/update'
