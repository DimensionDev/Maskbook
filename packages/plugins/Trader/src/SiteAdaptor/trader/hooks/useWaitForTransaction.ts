import { NetworkPluginID } from '@masknet/shared-base'
import { useNetworkDescriptors, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCallback, useEffect, useRef } from 'react'
import type { TransactionReceipt } from 'web3-core'

interface WaitOptions {
    chainId: ChainId
    hash: string
    confirmationCount?: number
    /**
     * @default 300_000 (30 seconds)
     */
    timeout?: number
}

export function useWaitForTransaction() {
    const timersRef = useRef<NodeJS.Timeout[]>([])
    useEffect(() => {
        return () => {
            timersRef.current.forEach((timer) => {
                clearTimeout(timer)
            })
        }
    }, [])

    const web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const networks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)

    return useCallback(
        ({ chainId, hash, confirmationCount = 3, timeout = 300_000 }: WaitOptions) => {
            return new Promise<TransactionReceipt>((resolve, reject) => {
                const start = Date.now()
                const averageBlockDelay = networks.find((x) => x.chainId === chainId)?.averageBlockDelay || 3
                async function check() {
                    if (Date.now() - start >= timeout) {
                        reject(new Error('timeout'))
                    }
                    const [receipt, blockNumber] = await Promise.all([
                        web3.getTransactionReceipt(hash, { chainId }),
                        web3.getBlockNumber(),
                    ])
                    if (receipt?.blockNumber && blockNumber - receipt.blockNumber >= confirmationCount) {
                        resolve(receipt)
                    } else {
                        const timer = setTimeout(() => {
                            timersRef.current = timersRef.current.filter((t) => t !== timer)
                            check()
                        }, averageBlockDelay)
                        timersRef.current.push(timer)
                    }
                }
                check()
            })
        },
        [networks, web3],
    )
}
