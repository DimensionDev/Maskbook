import { useAllPersonas, useLastRecognizedIdentity } from '@masknet/plugin-infra'
import { NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { first, intersectionWith } from 'lodash-es'
import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'

export function useQueryQuanlification(): AsyncFnReturn<
    () => Promise<
        | {
              hasPersona: boolean
              eligibility: boolean
              personas: PersonaInformation[]
              signablePersonas?: PersonaInformation[]
              signableWallets?: Wallet[]
          }
        | undefined
    >
> {
    const currentIdentity = useLastRecognizedIdentity()
    const personas = useAllPersonas()
    const wallets = useWallets()

    return useAsyncFn(async () => {
        if (!currentIdentity?.identifier?.userId) return
        const response = await NextIDProof.queryAllExistedBindingsByPlatform(
            NextIDPlatform.Twitter,
            currentIdentity.identifier.userId,
        )
        const sortPersonas = response.sort((a, b) => {
            const userId = currentIdentity.identifier?.userId.toLowerCase()
            if (!userId) return 0

            const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
            const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

            if (!p_a || !p_b) return 0
            if (p_a.last_checked_at > p_b.last_checked_at) return -1
            return 1
        })

        const walletAddressesFromNextID = response.flatMap((x) =>
            x.proofs.filter((y) => y.platform === NextIDPlatform.Ethereum && isValidAddress(y.identity)),
        )

        const signablePersonas = intersectionWith(
            personas.map((x) => ({
                ...x,
                persona: x.identifier.publicKeyAsHex.toLowerCase(),
            })),
            sortPersonas,
            (a, b) => {
                return a.persona === b.persona
            },
        )

        const signableWallets = intersectionWith(
            wallets.map((x) => ({
                ...x,
                identity: x.address,
            })),
            walletAddressesFromNextID,
            (a, b) => isSameAddress(a.identity, b.identity),
        )

        return {
            hasPersona: !!personas.length,
            eligibility: !!signablePersonas?.length || !!signableWallets.length,
            signablePersonas,
            signableWallets,
            personas,
        }
    }, [currentIdentity, personas, wallets])
}
