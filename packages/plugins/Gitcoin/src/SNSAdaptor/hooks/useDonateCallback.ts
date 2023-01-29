import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { compact } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { FungibleToken, toFixed } from '@masknet/web3-shared-base'
import { ChainId, ContractTransaction, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useBulkCheckoutContract } from './useBulkCheckoutWallet.js'

type DonationTuple = [string, string, string]

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param grantAmount
 * @param tipAmount
 * @param token
 */
export function useDonateCallback(
    address: string,
    grantAmount: string,
    tipAmount?: string,
    token?: FungibleToken<ChainId, SchemaType>,
) {
    const { GITCOIN_ETH_ADDRESS, GITCOIN_MAINTAINER_ADDRESS } = useGitcoinConstants()

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const bulkCheckoutContract = useBulkCheckoutContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const totalAmount = toFixed(new BigNumber(grantAmount).plus(tipAmount ?? 0))
    const donations = useMemo<DonationTuple[]>(() => {
        if (!address || !token || !GITCOIN_ETH_ADDRESS) return EMPTY_LIST
        return compact([
            [
                token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                grantAmount,
                address, // dest
            ],
            GITCOIN_MAINTAINER_ADDRESS && tipAmount && new BigNumber(tipAmount).gt(0)
                ? [
                      token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                      tipAmount,
                      GITCOIN_MAINTAINER_ADDRESS, // dest
                  ]
                : undefined,
        ])
    }, [address, grantAmount, tipAmount, token, GITCOIN_MAINTAINER_ADDRESS, GITCOIN_ETH_ADDRESS])

    return useAsyncFn(async () => {
        if (!connection || !token || !bulkCheckoutContract || !donations.length) {
            return
        }

        // estimate gas and compose transaction
        const tx = await new ContractTransaction(bulkCheckoutContract).fillAll(
            bulkCheckoutContract.methods.donate(donations),
            {
                from: account,
                value: token.schema === SchemaType.Native ? totalAmount : '0',
            },
        )
        return connection.sendTransaction(tx)
    }, [account, totalAmount, token, donations, connection])
}
