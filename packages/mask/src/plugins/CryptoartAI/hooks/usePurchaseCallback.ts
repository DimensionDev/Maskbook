import { useAsyncFn } from 'react-use'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePurchaseCallback(editionNumber: string, priceInWei: number) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { knownOriginDigitalAssetV2_contract } = useCryptoArtAI_Contract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(async () => {
        if (!connection || !knownOriginDigitalAssetV2_contract) return

        const config = {
            from: account,
            value: toFixed(priceInWei),
        }
        const tx = await encodeContractTransaction(
            knownOriginDigitalAssetV2_contract,
            knownOriginDigitalAssetV2_contract.methods.purchase(editionNumber),
            config,
        )
        return connection.sendTransaction(tx)
    }, [account, chainId, knownOriginDigitalAssetV2_contract, connection])
}
