import { useAsync } from 'react-use'
import type { PersonaInformation } from '@masknet/shared'
import { Services } from '../../../API'

export const useContacts = (network: string, currentPerson?: PersonaInformation) => {
    return useAsync(async () => {
        const relations = await Services.Identity.queryRelations(network, currentPerson?.identifier)

        const targets = relations.map((x) => x.profile)

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(targets)

        return profiles.map((profile) => {
            const favor = relations.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                favor,
                ...profile,
            }
        })
    }, [network, currentPerson])
}
