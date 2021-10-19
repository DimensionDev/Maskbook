import { TransactionEventType, TransactionStateType, useAccount, useGasPrice } from '@masknet/web3-shared-evm'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo } from '../types'
import { getPlayerStatus, PlayerStatus } from '../utils'
import type { TransactionReceipt } from 'web3-core'

export function useJoinGame(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const canJoinGame =
        (!info.currentPlayer || info.currentPlayer.canRejoin) &&
        info.currentSegment === 0 &&
        info.numberOfPlayers <= info.maxPlayersCount

    return {
        canJoinGame,
        joinGame: async () => {
            if (!contract) return
            const gasEstimate = await contract.methods.joinGame().estimateGas({
                from: account,
            })

            let txHash = ''
            return new Promise<void>(async (resolve, reject) => {
                contract.methods
                    .joinGame()
                    .send({
                        from: account,
                        gas: gasEstimate,
                    })
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                    .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                        if (receipt.status) {
                            resolve()
                        } else {
                            reject({
                                gameActionStatus: TransactionStateType.CONFIRMED,
                                ...receipt,
                            })
                        }
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject({
                            gameActionStatus: TransactionStateType.FAILED,
                            transactionHash: txHash,
                        })
                    })
            })
        },
    }
}

export function useMakeDeposit(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const gasPrice = useGasPrice()

    const status = getPlayerStatus(info, info.currentPlayer)
    const canMakeDeposit =
        info.currentPlayer &&
        info.currentSegment > 0 &&
        info.currentSegment < info.lastSegment &&
        status === PlayerStatus.Waiting

    return {
        canMakeDeposit,
        makeDeposit: async () => {
            if (contract) {
                const gasEstimate = await contract.methods.makeDeposit().estimateGas({
                    from: account,
                })

                let txHash = ''
                return new Promise<void>(async (resolve, reject) => {
                    contract.methods
                        .makeDeposit()
                        .send({
                            from: account,
                            gas: gasEstimate,
                        })
                        .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                        .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                            if (receipt.status) {
                                resolve()
                            } else {
                                reject({
                                    gameActionStatus: TransactionStateType.CONFIRMED,
                                    ...receipt,
                                })
                            }
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            reject({
                                gameActionStatus: TransactionStateType.FAILED,
                                transactionHash: txHash,
                            })
                        })
                })
            }
        },
    }
}

export function useWithdraw(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const gasPrice = useGasPrice()

    const canWithdraw = info.currentPlayer && !info.currentPlayer.withdrawn && info.gameHasEnded

    return {
        canWithdraw,
        withdraw: async () => {
            if (contract) {
                const gasEstimate = await contract.methods.withdraw().estimateGas({
                    from: account,
                })

                let txHash = ''
                return new Promise<void>(async (resolve, reject) => {
                    contract.methods
                        .withdraw()
                        .send({
                            from: account,
                            gas: gasEstimate,
                        })
                        .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                        .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                            if (receipt.status) {
                                resolve()
                            } else {
                                reject({
                                    gameActionStatus: TransactionStateType.CONFIRMED,
                                    ...receipt,
                                })
                            }
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            reject({
                                gameActionStatus: TransactionStateType.FAILED,
                                transactionHash: txHash,
                            })
                        })
                })
            }
        },
    }
}

export function useEarlyWithdraw(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const gasPrice = useGasPrice()

    const canEarlyWithdraw =
        info.currentPlayer && !info.currentPlayer.withdrawn && info.currentSegment < info.lastSegment

    return {
        canEarlyWithdraw,
        earlyWithdraw: async () => {
            if (contract) {
                const gasEstimate = await contract.methods.earlyWithdraw().estimateGas({
                    from: account,
                })

                let txHash = ''
                return new Promise<void>(async (resolve, reject) => {
                    contract.methods
                        .earlyWithdraw()
                        .send({
                            from: account,
                            gas: gasEstimate,
                        })
                        .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                        .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                            if (receipt.status) {
                                resolve()
                            } else {
                                reject({
                                    gameActionStatus: TransactionStateType.CONFIRMED,
                                    ...receipt,
                                })
                            }
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            reject({
                                gameActionStatus: TransactionStateType.FAILED,
                                transactionHash: txHash,
                            })
                        })
                })
            }
        },
    }
}
