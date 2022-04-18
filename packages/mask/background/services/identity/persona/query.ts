import { queryPersonasDB as queryPersonasFromIndexedDB } from '../../../database/persona/web'
export async function mobile_queryPersonaRecordsFromIndexedDB() {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryPersonasFromIndexedDB()
}
