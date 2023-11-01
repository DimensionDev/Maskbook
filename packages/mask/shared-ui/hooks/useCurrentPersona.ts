import { useAsync } from 'react-use'
import { currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '#services'

/**
 * Get current setting persona
 */
export function useCurrentPersona() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { value } = useAsync(async () => {
        const identifier = await Services.Settings.getCurrentPersonaIdentifier()

        if (!identifier) return
        return Services.Identity.queryPersona(identifier)
    }, [currentIdentifier])

    return value
}
