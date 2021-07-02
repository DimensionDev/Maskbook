import { useAsync } from 'react-use'
import type { PersonaInformation } from '@masknet/shared'
import { Services } from '../../../API'

export const useContacts = (network: string, currentPerson?: PersonaInformation) => {
    return useAsync(async () => {
        return Services.Identity.queryProfiles(network, currentPerson?.identifier)
    }, [network, currentPerson])
}
