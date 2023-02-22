import {
    useLastRecognizedIdentity,
    useCurrentPersonaInformation,
    useAllPersonas,
} from '@masknet/plugin-infra/content-script'
import { NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { intersectionWith, first } from 'lodash-es'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'

export function useQueryQualifications(): AsyncState<{
    hasVerifiedPersona: boolean
    signPersona?: PersonaInformation
    signWallet?: Wallet
}> {
    const currentIdentity = useLastRecognizedIdentity()
    const currentPersona = useCurrentPersonaInformation()
    const wallets = useWallets()
    const personas = useAllPersonas()

    return useAsync(async () => {
        if (!currentIdentity?.identifier?.userId || (!currentPersona && !wallets.length))
            return {
                hasVerifiedPersona: false,
            }

        // If currentPersona is bound, set the currentPersona be signer
        if (currentPersona) {
            const isVerifiedPersona = await NextIDProof.queryIsBound(
                currentPersona.identifier.publicKeyAsHex.toLowerCase(),
                NextIDPlatform.Twitter,
                currentIdentity?.identifier?.userId,
            )

            if (isVerifiedPersona)
                return {
                    hasVerifiedPersona: true,
                    signPersona: currentPersona,
                }
        }

        const response = await NextIDProof.queryAllExistedBindingsByPlatform(
            NextIDPlatform.Twitter,
            currentIdentity.identifier.userId,
        )

        const verifiedPersona = intersectionWith(
            personas.map((x) => ({ ...x, persona: x.identifier.publicKeyAsHex.toLowerCase() })),
            response,
            (a, b) => a.persona === b.persona,
        )

        const verifiedWallets = intersectionWith(
            wallets.map((x) => ({
                ...x,
                identity: x.address,
            })),
            response.flatMap((x) =>
                x.proofs.filter((y) => y.platform === NextIDPlatform.Ethereum && isValidAddress(y.identity)),
            ),
            (a, b) => isSameAddress(a.identity, b.identity),
        )

        if (verifiedPersona.length) {
            return {
                hasVerifiedPersona: true,
            }
        } else if (verifiedWallets.length) {
            return {
                hasVerifiedPersona: false,
                signWallet: first(verifiedWallets),
            }
        }

        return {
            hasVerifiedPersona: false,
        }
    }, [currentIdentity, currentPersona, wallets, personas])
}
