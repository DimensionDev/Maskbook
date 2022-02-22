import { useAsyncRetry } from 'react-use'
import type { NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import Services from '../../extension/service'

export const usePersonaBoundPlatform = (personaIdentifier: PersonaIdentifier) => {
    useAsyncRetry(() => {
        return Services.NextID.queryExistedBindingByPersona(personaIdentifier)
    }, [personaIdentifier.toText()])
}

export const useNextIDBoundByPlatform = (platform: NextIDPlatform, identity: string) => {
    useAsyncRetry(() => {
        return Services.NextID.queryExistedBindingByPlatform(platform, identity)
    }, [platform, identity])
}
