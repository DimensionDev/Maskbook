import { useAsyncFn } from 'react-use'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { FungibleToken, NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { ChainId, encodeContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { useDHedgePoolV1Contract, useDHedgePoolV2Contract } from '../contracts/useDHedgePool'
import { Pool, PoolType } from '../types'

/**
 * A callback for invest dhedge pool
 * @param pool the pool
 * @param amount
 * @param token
 */
export function useInvestCallback(pool: Pool | undefined, amount: string, token?: FungibleToken<ChainId, SchemaType>) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const poolV1Contract = useDHedgePoolV1Contract(chainId, pool?.address ?? '')
    const poolV2Contract = useDHedgePoolV2Contract(chainId, pool?.address ?? '')
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!token || !poolV1Contract || !poolV2Contract) return

        const config = {
            from: account,
            value: toFixed(token.schema === SchemaType.Native ? amount : 0),
        }

        const tx =
            pool?.poolType === PoolType.v1
                ? await encodeContractTransaction(poolV1Contract, poolV1Contract.methods.deposit(amount), config)
                : await encodeContractTransaction(
                      poolV2Contract,
                      poolV2Contract.methods.deposit(token.address, amount),
                      config,
                  )

        return connection?.sendTransaction(tx)
    }, [pool, account, amount, token, connection])
}
