import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'

/**
 * Transfer(address,address,uint256)
 */
const TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
export function useGetTransferReceived() {
    const web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async ({ hash, account, chainId }: { hash: string; account: string; chainId: number }) => {
            const receipt = await web3.getTransactionReceipt(hash, { chainId })
            const receiverTopic = `0x000000000000000000000000${account.slice(2)}`.toLowerCase()

            const datas = receipt?.logs
                .filter((x) => {
                    return x.topics.length === 3 && x.topics[0] === TOPIC && x.topics[2].toLowerCase() === receiverTopic
                })
                .map((log) => log.data)

            return datas?.length ? BigNumber.sum(...datas).toFixed() : undefined
        },
        [web3],
    )
}
