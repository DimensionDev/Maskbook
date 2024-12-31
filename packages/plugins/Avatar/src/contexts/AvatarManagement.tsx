import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { currentNextIDPlatform } from '@masknet/plugin-infra/content-script/context'
import { queryPersonaByProfile } from '@masknet/plugin-infra/dom/context'
import {
    type BindingProof,
    EMPTY_LIST,
    MaskMessages,
    type NextIDPersonaBindings,
    NextIDPlatform,
    type SocialIdentity,
} from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { first, noop } from 'lodash-es'
import {
    createContext,
    type Dispatch,
    memo,
    type PropsWithChildren,
    type SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { PFP_TYPE, type SelectTokenInfo } from '../types.js'

interface AvatarManagementContextOptions {
    isPending: boolean
    binding?: NextIDPersonaBindings
    targetAccount: string
    setTargetAccount: (account: string) => void
    // TODO: PFP_TYPE.background is unused
    pfpType: PFP_TYPE
    proof: BindingProof | undefined
    setProof: Dispatch<SetStateAction<BindingProof | undefined>>
    proofs: BindingProof[]
    setProofs: Dispatch<SetStateAction<BindingProof[]>>
    tokenInfo: Web3Helper.NonFungibleTokenAll | undefined
    setTokenInfo: Dispatch<SetStateAction<Web3Helper.NonFungibleTokenAll | undefined>>
    selectedTokenInfo: SelectTokenInfo | undefined
    setSelectedTokenInfo: Dispatch<SetStateAction<SelectTokenInfo | undefined>>
}

const AvatarManagementContext = createContext<AvatarManagementContextOptions>({
    isPending: false,
    binding: undefined,
    targetAccount: '',
    setTargetAccount: noop,
    pfpType: PFP_TYPE.PFP,
    proof: undefined,
    setProof: noop,
    proofs: EMPTY_LIST,
    setProofs: noop,
    tokenInfo: undefined,
    setTokenInfo: noop,
    selectedTokenInfo: undefined,
    setSelectedTokenInfo: noop,
})

interface Props extends PropsWithChildren<{ socialIdentity?: SocialIdentity }> {}

export const AvatarManagementProvider = memo(({ children }: Props) => {
    const identity = useLastRecognizedIdentity()

    const [proof, setProof] = useState<BindingProof>()
    const [proofs, setProofs] = useState<BindingProof[]>(EMPTY_LIST)
    const [tokenInfo, setTokenInfo] = useState<Web3Helper.NonFungibleTokenAll>()
    const { account } = useChainContext()
    const [selectedAccount, setSelectedAccount] = useState('')
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()

    const { data, isPending, refetch } = useQuery({
        queryKey: ['nft-avatar-state', identity],
        enabled: !!identity,
        queryFn: async () => {
            if (!identity?.identifier || !currentNextIDPlatform) return
            const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(
                currentNextIDPlatform,
                identity.identifier.userId.toLowerCase(),
            )
            const linkedPersona = await queryPersonaByProfile(identity.identifier)
            const personaBindings = bindings.filter(
                (x) => x.persona === linkedPersona?.identifier.publicKeyAsHex.toLowerCase(),
            )
            const binding = first(personaBindings)
            return {
                ...identity,
                publicKey: linkedPersona?.identifier.publicKeyAsHex,
                hasBinding: personaBindings.length > 0,
                binding,
                nextIdWallets: binding?.proofs.filter(
                    (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
                ),
                nextIdPersonas: binding?.proofs.filter(
                    (x) => x.identity.toLowerCase() === identity.identifier?.userId.toLowerCase(),
                ),
            }
        },
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => refetch()), [refetch])

    const contextValue: AvatarManagementContextOptions = useMemo(() => {
        return {
            binding: data?.binding,
            isPending,
            pfpType: PFP_TYPE.PFP,
            targetAccount: selectedAccount || account || first(data?.nextIdWallets)?.identity || '',
            setTargetAccount: setSelectedAccount,
            proof: proof ?? first(data?.nextIdPersonas),
            setProof,
            proofs: proofs.length ? proofs : (data?.nextIdWallets ?? EMPTY_LIST),
            setProofs,
            tokenInfo,
            setTokenInfo,
            selectedTokenInfo,
            setSelectedTokenInfo,
        }
    }, [selectedAccount, proof, proofs, tokenInfo, selectedTokenInfo, data, account, isPending])

    return <AvatarManagementContext value={contextValue}>{children}</AvatarManagementContext>
})

AvatarManagementProvider.displayName = 'AvatarManagementProvider'

export function useAvatarManagement() {
    return useContext(AvatarManagementContext)
}
