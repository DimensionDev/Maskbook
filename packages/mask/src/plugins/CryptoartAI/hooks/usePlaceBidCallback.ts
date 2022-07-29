import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { encodeContractTransaction, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePlaceBidCallback(is24Auction: boolean, editionNumber: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { artistAcceptingBidsV2_contract, cANFTMarket_contract } = useCryptoArtAI_Contract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(
        async (priceInWei: number) => {
            if (!connection) return
            if (!is24Auction && !artistAcceptingBidsV2_contract) return
            if (is24Auction && !cANFTMarket_contract) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: toFixed(priceInWei),
            }
            const tx = is24Auction
                ? await encodeContractTransaction(
                      artistAcceptingBidsV2_contract!,
                      artistAcceptingBidsV2_contract!.methods.placeBid(editionNumber),
                      config,
                  )
                : await encodeContractTransaction(
                      cANFTMarket_contract!,
                      cANFTMarket_contract!.methods.placeBid(editionNumber, ZERO_ADDRESS),
                      config,
                  )
            return connection.sendTransaction(tx)
        },
        [account, chainId, is24Auction, editionNumber, artistAcceptingBidsV2_contract, cANFTMarket_contract],
    )
}
