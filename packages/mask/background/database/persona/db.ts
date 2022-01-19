import { hasNativeAPI } from '../../../shared/native-rpc'
export * from './type'

export const {
    queryProfilesDB,
    queryProfileDB,
    queryPersonaDB,
    queryPersonasDB,
    detachProfileDB,
    deletePersonaDB,
    safeDeletePersonaDB,
    queryPersonaByProfileDB,
    createPersonaDB,
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    updatePersonaDB,
    createOrUpdatePersonaDB,
    queryProfilesPagedDB,
    createOrUpdateProfileDB,
    createProfileDB,
    createRelationDB,
    createRelationsTransaction,
    deleteProfileDB,
    queryRelationsPagedDB,
    updateRelationDB,
    queryPersonasWithPrivateKey,
    queryRelations,
} = new Proxy({} as any as typeof import('./web'), {
    get(_, key) {
        return async function () {
            if (hasNativeAPI) {
                return import('./app').then((x) => (x as any)[key])
            }

            return import('./web').then((x) => (x as any)[key])
        }
    },
})
