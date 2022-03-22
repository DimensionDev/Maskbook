import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryPersonaDB } from '../../../database/persona/db'

export async function exportPersonaMnemonicWords(identifier: PersonaIdentifier): Promise<string | undefined> {
    const record = await queryPersonaDB(identifier)
    return record?.mnemonic?.words
}
