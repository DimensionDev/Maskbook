import type { BackupJSONFileLatest } from '../../../utils'
import { consistentPersonaDBWriteAccess } from '../../../database/Persona/Persona.db'
import { PersonaRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/PersonaRecord'
import { ProfileRecordFromJSONFormat } from '../../../utils/type-transform/BackupFormat/JSON/DBRecord-JSON/ProfileRecord'
import { createOrUpdateNewRelation } from '../IdentityService'

export async function restoreRelations(data: BackupJSONFileLatest) {
    {
        await consistentPersonaDBWriteAccess(async (t) => {
            // For 1.x backups
            if (!data.relations.length) {
                for (const x of data.personas) {
                    const personaRecord = PersonaRecordFromJSONFormat(x)

                    if (personaRecord.privateKey) {
                        for (const profile of data.profiles) {
                            const profileRecord = ProfileRecordFromJSONFormat(profile)
                            await createOrUpdateNewRelation(
                                profileRecord.identifier,
                                personaRecord.identifier,
                                0,
                                false,
                            )
                        }
                    }
                }
            }
        })
    }
}
