export {
    createPersonaByPrivateKey,
    mobile_restoreFromMnemonicWords,
    createPersonaByMnemonic,
    createPersonaByMnemonicV2,
} from './persona/create'
export {
    mobile_queryPersonaRecordsFromIndexedDB,
    mobile_queryPersonas,
    queryOwnedPersonaInformation,
    queryLastPersonaCreated,
} from './persona/query'
export {
    deletePersona,
    logoutPersona,
    setupPersona,
    loginExistPersonaByPrivateKey,
    mobile_queryPersonaByPrivateKey,
    renamePersona,
    queryPersonaByMnemonic,
} from './persona/update'
export { signWithPersona, type SignRequest, type SignRequestResult, generateSignResult } from './persona/sign'
export { getPersonaAvatar, updatePersonaAvatar } from './persona/avatar'

export {
    mobile_queryProfiles,
    mobile_queryProfileRecordFromIndexedDB,
    hasLocalKey,
    queryProfilesInformation,
    queryOwnedProfilesInformation,
} from './profile/query'
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
export {
    mobile_queryRelationsRecordFromIndexedDB,
    queryRelationPaged,
    type QueryRelationPagedOptions,
} from './relation/query'
export { updateRelation } from './relation/update'

export { validateMnemonic } from './persona/utils'
export { queryAvatarsDataURL } from './avatar/query'
