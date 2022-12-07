import { first } from 'lodash-es'
import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import {
    useLastRecognizedIdentity,
    useCurrentPersonaInformation,
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import { SmartPayFunder } from '@masknet/web3-providers'
import type { ContractAccountAPI } from '@masknet/web3-providers/types'
import { ProviderType, ChainId, getSmartPayConstants, ContractWallet } from '@masknet/web3-shared-evm'
import { SignAccount, SignAccountType } from '../type.js'

export function useDeploy(
    signAccount?: SignAccount,
    contractAccount?: ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>,
) {
    const { personaSignPayMessage } = useSNSAdaptorContext()
    const currentVisitingProfile = useLastRecognizedIdentity()
    const currentPersona = useCurrentPersonaInformation()

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        providerType: ProviderType.MaskWallet,
        chainId: ChainId.Mumbai,
    })

    return useAsyncFn(async () => {
        if (!currentVisitingProfile?.identifier?.userId || !currentPersona || !signAccount?.address || !contractAccount)
            return

        const payload = JSON.stringify({
            twitterHandler: currentVisitingProfile.identifier.userId,
            ts: getUnixTime(new Date()),
            publicKey: currentPersona?.identifier.publicKeyAsHex,
            nonce: 4,
        })

        let signature

        if (signAccount.type === SignAccountType.Persona && signAccount?.raw?.identifier) {
            signature = await personaSignPayMessage({
                message: payload,
                identifier: signAccount.raw.identifier,
            })
        } else if (signAccount.type === SignAccountType.Wallet) {
            await connection?.connect({ providerType: ProviderType.MaskWallet, account: signAccount.address })
            signature = await connection?.signMessage(payload, 'personalSign', {
                account: signAccount.address,
                providerType: ProviderType.MaskWallet,
            })
        } else return

        if (!signature) return

        const response = await SmartPayFunder.fund(ChainId.Mumbai, {
            ownerAddress: signAccount.address,
            signature,
            payload,
        })

        if (!response.walletAddress) return

        const entryPoints = await connection?.supportedEntryPoints?.()
        const entryPoint = first(entryPoints)

        if (!entryPoint) return

        const { LOGIC_WALLET_CONTRACT_ADDRESS } = getSmartPayConstants(ChainId.Mumbai)

        if (!LOGIC_WALLET_CONTRACT_ADDRESS) throw new Error('No logic wallet contract.')

        const contractWallet = new ContractWallet(
            signAccount.address,
            LOGIC_WALLET_CONTRACT_ADDRESS,
            entryPoint,
            ChainId.Mumbai,
        )
        if (!contractWallet.initCode) throw new Error('Failed to create initCode.')
        await connection?.deployContractWallet?.(
            {
                initCode: contractWallet.initCode,
                sender: contractAccount.address,
            },
            {
                account: contractAccount?.address,
                chainId: ChainId.Mumbai,
                providerType: ProviderType.MaskWallet,
            },
        )
    }, [connection, signAccount, currentVisitingProfile?.identifier, currentPersona, contractAccount])
}
