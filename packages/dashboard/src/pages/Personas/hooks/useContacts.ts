import { useAsync } from 'react-use'
import { Services } from '../../../API'
import { useRelations } from '../api'

export const useContacts = (network: string) => {
    const relations = useRelations()
    return useAsync(async () => {
        const targets = relations.filter((x) => x.profile.network === network).map((x) => x.profile)

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(targets)

        return profiles.map((profile) => {
            const favor = relations.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                favor,
                ...profile,
            }
        })
    }, [network, relations])
}
