import type { AuthorizationAPI } from '../entry-types.js'
import { isZeroAddress, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { approvalListState } from './approvalListState.js'
import { Web3API } from '../Connection/index.js'
import { TOKEN_APPROVAL_TOPIC, NFT_APPROVAL_TOPIC } from './constants.js'
import { maxBy, mapKeys } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import type { Log } from 'web3-core'
import type Web3 from 'web3'
import {
    isSameAddress,
    type FungibleTokenSpender,
    isGreaterThan,
    type NonFungibleContractSpender,
} from '@masknet/web3-shared-base'
import { getAllMaskDappContractInfo } from '../helpers/getAllMaskDappContractInfo.js'
import { EMPTY_LIST } from '@masknet/shared-base'

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
            const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'token')

            const tokenSpenderRecords = parseLogs(web3, logs)

            mapKeys(tokenSpenderRecords, (spender, spenderAddress) =>
                mapKeys(spender, (token, tokenAddress) => {
                    const latestTx = maxBy(token, (x) => x.blockNumber)
                    if (!latestTx) return
                    const amount = new BigNumber(isZeroAddress(latestTx.data) ? 0 : latestTx.data)
                    approvalListState.updateTokenState(
                        account,
                        spenderAddress,
                        tokenAddress,
                        chainId,
                        toBlock,
                        latestTx.blockNumber,
                        amount,
                    )
                }),
            )

            const spenderList = approvalListState.tokenState[account]?.[chainId]?.spenderList

            if (!spenderList) return EMPTY_LIST

            return Object.keys(spenderList)
                .map((spender) => {
                    return Object.keys(spenderList[spender]).map((address) => {
                        const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                            isSameAddress(y.address, spender),
                        )

                        return {
                            tokenInfo: { address, name: '', symbol: '' },
                            address: spender,
                            name: maskDappContractInfo?.name,
                            logo: maskDappContractInfo?.logo,
                            rawAmount: spenderList[spender][address].amount.toNumber(),
                            transactionBlockNumber: spenderList[spender][address].transactionBlockNumber,
                            isMaskDapp: Boolean(maskDappContractInfo),
                        }
                    })
                })
                .flat()
                .filter((x) => isGreaterThan(x.rawAmount, 0))
                .sort((a, b) => {
                    if (a.isMaskDapp && !b.isMaskDapp) return -1
                    if (!a.isMaskDapp && b.isMaskDapp) return 1
                    return Number(b.transactionBlockNumber) - Number(a.transactionBlockNumber)
                }) as Array<FungibleTokenSpender<ChainId, SchemaType>>
        } catch (error) {
            console.log(error)
            return EMPTY_LIST
        }
    }

    async getNonFungibleTokenSpenders(chainId: ChainId, account: string) {
        try {
            const web3 = this.createWeb3(chainId)
            const fromBlock = approvalListState.nftState[account]?.[chainId]?.fromBlock ?? 0
            const toBlock = await web3.eth.getBlockNumber()
            const logs = await web3.eth.getPastLogs({
                topics: [NFT_APPROVAL_TOPIC, web3.eth.abi.encodeParameter('address', account)],
                fromBlock,
                toBlock,
            })
            const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'nft')

            const nftSpenderRecords = parseLogs(web3, logs)

            mapKeys(nftSpenderRecords, (spender, spenderAddress) =>
                mapKeys(spender, (token, tokenAddress) => {
                    const latestTx = maxBy(token, (x) => x.blockNumber)
                    if (!latestTx) return
                    const approved = Number.parseInt(latestTx.data, 16) === 1
                    approvalListState.updateNFT_State(
                        account,
                        spenderAddress,
                        tokenAddress,
                        chainId,
                        toBlock,
                        latestTx.blockNumber,
                        approved,
                    )
                }),
            )

            const spenderList = approvalListState.nftState[account]?.[chainId]?.spenderList

            if (!spenderList) return EMPTY_LIST

            return Object.keys(spenderList)
                .map((spender) => {
                    return Object.keys(spenderList[spender]).map((address) => {
                        const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                            isSameAddress(y.address, spender),
                        )

                        return {
                            contract: { address, name: '' },
                            address: spender,
                            name: maskDappContractInfo?.name,
                            logo: maskDappContractInfo?.logo,
                            amount: '1',
                            approved: spenderList[spender][address].approved,
                            transactionBlockNumber: spenderList[spender][address].transactionBlockNumber,
                            isMaskDapp: Boolean(maskDappContractInfo),
                        }
                    })
                })
                .flat()
                .filter((x) => x.approved)
                .sort((a, b) => {
                    if (a.isMaskDapp && !b.isMaskDapp) return -1
                    if (!a.isMaskDapp && b.isMaskDapp) return 1
                    return Number(b.transactionBlockNumber) - Number(a.transactionBlockNumber)
                }) as Array<NonFungibleContractSpender<ChainId, SchemaType>>
        } catch (error) {
            console.log(error)
            return EMPTY_LIST
        }
    }
}

function parseLogs(web3: Web3, logs: Log[]) {
    return logs
        .filter((x) => x.topics.length === 3 && x.data !== '0x')
        .reduce<Record<string, Record<string, Array<{ blockNumber: number; data: string }>>>>((acc, cur) => {
            const spender = web3.eth.abi.decodeParameter('address', cur.topics[2]) as unknown as string
            if (isZeroAddress(spender)) return acc
            if (!acc[spender]) acc[spender] = {}

            if (acc[spender][cur.address]) {
                acc[spender][cur.address].push({ blockNumber: cur.blockNumber, data: cur.data })
            } else {
                acc[spender][cur.address] = [{ blockNumber: cur.blockNumber, data: cur.data }]
            }

            return acc
        }, {})
}
