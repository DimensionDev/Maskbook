import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useMessages, useServices } from './useContext.js'
import { usePersonasFromDB } from './usePersonasFromDB.js'

export function usePersonasConnected() {
    const messages = useMessages()
    const services = useServices()
    const { value: personasFromDB = EMPTY_LIST } = usePersonasFromDB()
    const asyncResult = useAsyncRetry(async () => {
        const allPersonaPublicKeys = personasFromDB.map((x) => x.identifier.publicKeyAsHex)
        const allPersonaIdentifiers = personasFromDB.map((x) => x.identifier)
        const avatars = await services.getPersonaAvatars(allPersonaIdentifiers)
        const allNextIDBindings = await NextIDProof.queryExistedBindingByPlatform(
            NextIDPlatform.NextID,
            allPersonaPublicKeys.join(','),
        )

        return personasFromDB.map((persona) => {
            return {
                avatar: avatars.get(persona.identifier),
                persona,
                proof:
                    allNextIDBindings
                        .find((p) => p.persona.toLowerCase() === persona.identifier.publicKeyAsHex.toLowerCase())
                        ?.proofs.filter((x) => x.is_valid) ?? EMPTY_LIST,
            }
        })
    }, [services, personasFromDB.length])

    useEffect(() => messages.events.ownProofChanged.on(asyncResult.retry), [messages, asyncResult.retry])

    return asyncResult
}
