import { BigNumber } from 'bignumber.js'
import { AbiCoder } from 'web3-eth-abi'
import type { Log } from 'web3-core'
import { maxBy, mapKeys } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { isZeroAddress, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { TOKEN_APPROVAL_TOPIC, NFT_APPROVAL_TOPIC } from './constants.js'
import {
    isSameAddress,
    type FungibleTokenSpender,
    type NonFungibleContractSpender,
    isGreaterThan,
} from '@masknet/web3-shared-base'
import {
    approvalListState,
    type TokenApprovalInfoAccountMap,
    type NFTApprovalInfoAccountMap,
} from './approvalListState.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { getAllMaskDappContractInfo } from '../helpers/getAllMaskDappContractInfo.js'
import type { AuthorizationAPI } from '../entry-types.js'

export class ApprovalAPI implements AuthorizationAPI.Provider<ChainId> {
    private Web3 = new ConnectionReadonlyAPI()

    async getFungibleTokenSpenders(chainId: ChainId, account: string) {
        try {
            const { toBlock, records: tokenSpenderRecords } = await this.parseSpenderRecords(
                chainId,
                account,
                TOKEN_APPROVAL_TOPIC,
                approvalListState.tokenState,
            )
            const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'token')

            mapKeys(tokenSpenderRecords, (spender, spenderAddress) =>
                mapKeys(spender, (tokens, tokenAddress) => {
                    const latestBlockTx = maxBy(tokens, (x) => x.blockNumber)
                    const latestTx = maxBy(
                        tokens.filter((x) => x.blockNumber === latestBlockTx?.blockNumber),
                        (x) => x.transactionIndex,
                    )
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
            const spenderList = approvalListState.tokenState[account.toLowerCase()]?.get(chainId)?.spenderList

            if (!spenderList) return EMPTY_LIST

            return Array.from(spenderList.keys())
                .flatMap((spender) => {
                    return Array.from(spenderList.get(spender)!.keys()).map((address) => {
                        const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                            isSameAddress(y.address, spender),
                        )
                        return {
                            tokenInfo: { address, name: '', symbol: '' },
                            address: spender,
                            name: maskDappContractInfo?.name,
                            logo: maskDappContractInfo?.logo,
                            rawAmount: spenderList.get(spender)?.get(address)?.amount.toNumber() ?? 0,
                            transactionBlockNumber: spenderList.get(spender)?.get(address)?.transactionBlockNumber ?? 0,
                            isMaskDapp: Boolean(maskDappContractInfo),
                        }
                    })
                })
                .filter((x) => isGreaterThan(x.rawAmount, 0))
                .sort((a, b) => {
                    if (a.isMaskDapp && !b.isMaskDapp) return -1
                    if (!a.isMaskDapp && b.isMaskDapp) return 1
                    return b.transactionBlockNumber - a.transactionBlockNumber
                }) as Array<FungibleTokenSpender<ChainId, SchemaType>>
        } catch (error) {
            return EMPTY_LIST
        }
    }

    async getNonFungibleTokenSpenders(chainId: ChainId, account: string) {
        try {
            const { toBlock, records: nftSpenderRecords } = await this.parseSpenderRecords(
                chainId,
                account,
                NFT_APPROVAL_TOPIC,
                approvalListState.nftState,
            )
            const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'nft')

            mapKeys(nftSpenderRecords, (spender, spenderAddress) =>
                mapKeys(spender, (nfts, tokenAddress) => {
                    const latestBlockTx = maxBy(nfts, (x) => x.blockNumber)
                    const latestTx = maxBy(
                        nfts.filter((x) => x.blockNumber === latestBlockTx?.blockNumber),
                        (x) => x.transactionIndex,
                    )
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

            const spenderList = approvalListState.nftState[account.toLowerCase()]?.get(chainId)?.spenderList

            if (!spenderList) return EMPTY_LIST

            return Array.from(spenderList.keys())
                .flatMap((spender) => {
                    return Array.from(spenderList.get(spender)!.keys()).map((address) => {
                        const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                            isSameAddress(y.address, spender),
                        )

                        return {
                            contract: { address, name: '' },
                            address: spender,
                            name: maskDappContractInfo?.name,
                            logo: maskDappContractInfo?.logo,
                            amount: '1',
                            approved: spenderList.get(spender)?.get(address)?.approved,
                            transactionBlockNumber: spenderList.get(spender)?.get(address)?.transactionBlockNumber ?? 0,
                            isMaskDapp: Boolean(maskDappContractInfo),
                        }
                    })
                })
                .filter((x) => x.approved)
                .sort((a, b) => {
                    if (a.isMaskDapp && !b.isMaskDapp) return -1
                    if (!a.isMaskDapp && b.isMaskDapp) return 1
                    return b.transactionBlockNumber - a.transactionBlockNumber
                }) as Array<NonFungibleContractSpender<ChainId, SchemaType>>
        } catch (error) {
            return EMPTY_LIST
        }
    }

    private async parseSpenderRecords(
        chainId: ChainId,
        account: string,
        topic: string,
        state: TokenApprovalInfoAccountMap | NFTApprovalInfoAccountMap,
    ) {
        const fromBlock = state[account]?.get(chainId)?.fromBlock ?? 0
        const toBlock = await this.Web3.getBlockNumber({ chainId })
        const logs = await this.Web3.getWeb3({ chainId }).eth.getPastLogs({
            topics: [topic, new AbiCoder().encodeParameter('address', account)],
            fromBlock,
            toBlock,
        })

        return { records: parseLogs(logs), toBlock }
    }
}

function parseLogs(logs: Log[]) {
    return logs
        .filter((x) => x.topics.length === 3 && x.data !== '0x')
        .reduce<Record<string, Record<string, Array<{ blockNumber: number; data: string; transactionIndex: number }>>>>(
            (acc, cur) => {
                const spender = new AbiCoder().decodeParameter('address', cur.topics[2]) as unknown as string
                if (isZeroAddress(spender)) return acc
                if (!acc[spender]) acc[spender] = {}

                if (acc[spender][cur.address]) {
                    acc[spender][cur.address].push({
                        blockNumber: cur.blockNumber,
                        data: cur.data,
                        transactionIndex: cur.transactionIndex,
                    })
                } else {
                    acc[spender][cur.address] = [
                        { blockNumber: cur.blockNumber, data: cur.data, transactionIndex: cur.transactionIndex },
                    ]
                }

                return acc
            },
            {},
        )
}
