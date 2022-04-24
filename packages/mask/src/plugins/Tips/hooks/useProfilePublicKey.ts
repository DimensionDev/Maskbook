import { ProfileIdentifier } from '@masknet/shared-base'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'

export function useProfilePublicKey(receiver: ProfileIdentifier | undefined) {
    const { value: publicKey } = useAsync(async () => {
        if (!receiver) return
        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        return persona?.publicHexKey
    }, [receiver])
    return publicKey
}
