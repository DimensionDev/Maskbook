import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { FungibleToken, toFixed } from '@masknet/web3-shared-base'
import { ChainId, ContractTransaction, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useBulkCheckoutContract } from './useBulkCheckoutWallet.js'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useDonateCallback(address: string, amount: string, token?: FungibleToken<ChainId, SchemaType>) {
    const { GITCOIN_ETH_ADDRESS, GITCOIN_TIP_PERCENTAGE } = useGitcoinConstants()

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const bulkCheckoutContract = useBulkCheckoutContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const donations = useMemo((): Array<[string, string, string]> => {
        if (!connection || !address || !token || !GITCOIN_ETH_ADDRESS || !GITCOIN_TIP_PERCENTAGE) return EMPTY_LIST
        const tipAmount = new BigNumber(GITCOIN_TIP_PERCENTAGE / 100).multipliedBy(amount)
        const grantAmount = new BigNumber(amount).minus(tipAmount)
        return [
            [
                token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                tipAmount.toFixed(0),
                address, // dest
            ],
            [
                token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                grantAmount.toFixed(0),
                address, // dest
            ],
        ]
    }, [address, amount, token])

    return useAsyncFn(async () => {
        if (!connection || !token || !bulkCheckoutContract || !donations.length) {
            return
        }

        // estimate gas and compose transaction
        const tx = await new ContractTransaction(bulkCheckoutContract).encodeWithGas(
            bulkCheckoutContract.methods.donate(donations),
            {
                from: account,
                value: toFixed(token.schema === SchemaType.Native ? amount : 0),
            },
        )
        return connection.sendTransaction(tx)
    }, [account, amount, token, donations, connection])
}
