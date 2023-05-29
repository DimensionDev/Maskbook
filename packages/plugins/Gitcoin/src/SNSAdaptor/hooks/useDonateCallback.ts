import { useMemo } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import type { AsyncFnReturn, AsyncState } from 'react-use/lib/useAsync.js'
import { compact } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { type FungibleToken, toFixed } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { type ChainId, ContractTransaction, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useGasPrice } from '@masknet/web3-hooks-base'
import { useBulkCheckoutContract } from './useBulkCheckoutWallet.js'

type DonationTuple = [string, string, string]

type ResultTuple = [
    AsyncFnReturn<() => Promise<string | undefined>>[0],
    AsyncState<string>,
    AsyncFnReturn<() => Promise<string | undefined>>[1],
]

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
    tipAmount: string,
    token?: FungibleToken<ChainId, SchemaType>,
): ResultTuple {
    const { GITCOIN_ETH_ADDRESS, GITCOIN_MAINTAINER_ADDRESS } = useGitcoinConstants()

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const bulkCheckoutContract = useBulkCheckoutContract(chainId)

    const totalAmount = toFixed(new BigNumber(grantAmount).plus(tipAmount))
    const donations = useMemo<DonationTuple[]>(() => {
        if (!address || !token || !GITCOIN_ETH_ADDRESS) return EMPTY_LIST
        return compact([
            [
                token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                grantAmount,
                address, // dest
            ],
            GITCOIN_MAINTAINER_ADDRESS && new BigNumber(tipAmount).gt(0)
                ? [
                      token.schema === SchemaType.Native ? GITCOIN_ETH_ADDRESS : token.address,
                      tipAmount,
                      GITCOIN_MAINTAINER_ADDRESS, // dest
                  ]
                : undefined,
        ])
    }, [address, grantAmount, tipAmount, token, GITCOIN_MAINTAINER_ADDRESS, GITCOIN_ETH_ADDRESS])

    const { gasPrice } = useGasConfig(chainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const gasState = useAsync(async () => {
        if (!bulkCheckoutContract || !token) return '0'
        const price = !gasPrice || gasPrice === '0' ? defaultGasPrice : gasPrice

        // estimate gas and compose transaction
        const tx = await new ContractTransaction(bulkCheckoutContract).fillAll(
            bulkCheckoutContract.methods.donate(donations),
            {
                from: account,
                value: token.schema === SchemaType.Native ? totalAmount : '0',
            },
        )
        return new BigNumber(tx.gas ?? 1).times(price).toFixed(0)
    }, [gasPrice, defaultGasPrice, bulkCheckoutContract, token])

    const [callbackState, callback] = useAsyncFn(async () => {
        if (!token || !bulkCheckoutContract || !donations.length) return

        // estimate gas and compose transaction
        const tx = await new ContractTransaction(bulkCheckoutContract).fillAll(
            bulkCheckoutContract.methods.donate(donations),
            {
                from: account,
                value: token.schema === SchemaType.Native ? totalAmount : '0',
            },
        )
        return Web3.sendTransaction(tx)
    }, [account, totalAmount, token, donations])

    return [callbackState, gasState, callback]
}
