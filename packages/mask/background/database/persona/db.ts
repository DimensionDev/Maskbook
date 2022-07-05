import { hasNativeAPI } from '../../../shared/native-rpc'
export * from './type'

function assign(module: any) {
    ;({
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
        createPersonaDBReadonlyAccess,
        consistentPersonaDBWriteAccess,
        updatePersonaDB,
        createOrUpdatePersonaDB,
        createOrUpdateProfileDB,
        createProfileDB,
        createRelationDB,
        createRelationsTransaction,
        deleteProfileDB,
        queryRelationsPagedDB,
        updateRelationDB,
        queryPersonasWithPrivateKey,
        queryRelations,
        createOrUpdateRelationDB,
    } = module)
    return module
}
export let {
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
    createPersonaDBReadonlyAccess,
    consistentPersonaDBWriteAccess,
    updatePersonaDB,
    createOrUpdatePersonaDB,
    createOrUpdateProfileDB,
    createProfileDB,
    createRelationDB,
    createRelationsTransaction,
    deleteProfileDB,
    queryRelationsPagedDB,
    updateRelationDB,
    queryPersonasWithPrivateKey,
    queryRelations,
    createOrUpdateRelationDB,
} = new Proxy({} as any as typeof import('./web'), {
    get(_, key) {
        return async function (...args: any) {
            if (hasNativeAPI) {
                return import('./app').then((module) => assign(module)[key](...args))
            }

            return import('./web').then((module) => assign(module)[key](...args))
        }
    },
})
