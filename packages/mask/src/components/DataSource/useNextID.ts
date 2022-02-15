import { useAsyncRetry } from 'react-use'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryExistedBindingByPersona, NextIDPlatform, queryExistedBindingByPlatform } from '@masknet/web3-providers'

export const usePersonaBoundPlatform = (personaIdentifier: PersonaIdentifier) => {
    useAsyncRetry(() => {
        return queryExistedBindingByPersona(personaIdentifier)
    }, [personaIdentifier.toText()])
}

export const useNextIDBoundByPlatform = (platform: NextIDPlatform, identity: string) => {
    useAsyncRetry(() => {
        return queryExistedBindingByPlatform(platform, identity)
    }, [platform, identity])
}
