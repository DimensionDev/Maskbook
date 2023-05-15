import type { AuthorizationAPI } from '../entry-types.js'
import { type ChainId } from '@masknet/web3-shared-evm'
import { approvalListState } from './approvalListState.js'
import { Web3API } from '../Connection/index.js'
import { TOKEN_APPROVAL_TOPIC } from './constants.js'
import { maxBy, mapKeys } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import type { Log } from 'web3-core'
import type Web3 from 'web3'

export class ApprovalAPI implements AuthorizationAPI.Provider<ChainId> {
    private Web3 = new Web3API()

    private createWeb3(chainId: ChainId) {
        return this.Web3.getWeb3(chainId)
    }

    async getFungibleTokenSpenders(chainId: ChainId, account: string) {
        try {
            const web3 = this.createWeb3(chainId)
            const fromBlock = approvalListState.tokenState[account]?.[chainId]?.fromBlock ?? 0
            const toBlock = await web3.eth.getBlockNumber()
            const logs = await web3.eth.getPastLogs({
                topics: [TOKEN_APPROVAL_TOPIC, web3.eth.abi.encodeParameter('address', account)],
                fromBlock,
                toBlock,
            })

            const tokenSpenderRecords = parseLogs(web3, logs)

            mapKeys(tokenSpenderRecords, (spender, spenderAddress) =>
                mapKeys(spender, (token, tokenAddress) => {
                    const latestEntry = maxBy(token, (x) => x.blockNumber)
                    if (!latestEntry) return
                    const amount = new BigNumber(latestEntry.data)
                    approvalListState.updateTokenState(account, spenderAddress, tokenAddress, chainId, toBlock, amount)
                }),
            )

            console.log({ r: approvalListState.tokenState, fromBlock, logs })
            return []
        } catch (error) {
            console.log(error)
            return []
        }
    }
}

function parseLogs(web3: Web3, logs: Log[]) {
    return logs
        .filter((x) => x.data !== '0x')
        .reduce<Record<string, Record<string, Array<{ blockNumber: number; data: string }>>>>((acc, cur) => {
            const spender = web3.eth.abi.decodeParameter('address', cur.topics[2]) as unknown as string
            if (!acc[spender]) acc[spender] = {}

            if (acc[spender][cur.address]) {
                acc[spender][cur.address].push({ blockNumber: cur.blockNumber, data: cur.data })
            } else {
                acc[spender][cur.address] = [{ blockNumber: cur.blockNumber, data: cur.data }]
            }

            return acc
        }, {})
}
