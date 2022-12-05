import { useAllPersonas, useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { NextIDProof, SmartPayFunder } from '@masknet/web3-providers'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { first, intersectionWith } from 'lodash-es'
import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'
import type { SignablePersona } from '../type.js'

export function useQueryQualification(): AsyncFnReturn<
    () => Promise<
        | {
              hasPersona: boolean
              eligibility: boolean
              personas: PersonaInformation[]
              signablePersonas?: SignablePersona[]
              signableWallets?: Wallet[]
              isVerify: boolean
          }
        | undefined
    >
> {
    const currentIdentity = useLastRecognizedIdentity()

    const personas = useAllPersonas()
    const wallets = useWallets()
    const { generateSignResult } = useSNSAdaptorContext()

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

        const signablePersonas = await Promise.all(
            intersectionWith(
                personas.map((x) => ({
                    ...x,
                    persona: x.identifier.publicKeyAsHex.toLowerCase(),
                })),
                sortPersonas,
                (a, b) => {
                    return a.persona === b.persona
                },
            ).map(async (x) => {
                return {
                    ...x,
                    address: (await generateSignResult(x.identifier, '')).address,
                }
            }),
        )

        const signableWallets = intersectionWith(
            wallets.map((x) => ({
                ...x,
                identity: x.address,
            })),
            walletAddressesFromNextID,
            (a, b) => isSameAddress(a.identity, b.identity),
        )

        const isVerify = await SmartPayFunder.verify(currentIdentity.identifier.userId)
        return {
            isVerify,
            hasPersona: !!personas.length,
            eligibility: !!signablePersonas?.length || !!signableWallets.length,
            signablePersonas,
            signableWallets,
            personas,
        }
    }, [currentIdentity, personas, wallets, generateSignResult])
}
