import { useAccount, useGasPrice } from '@masknet/web3-shared'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo } from '../types'
import { getPlayerStatus, PlayerStatus } from '../utils'

export function useJoinGame(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const gasPrice = useGasPrice()
    const canJoinGame = (!info.currentPlayer || info.currentPlayer.canRejoin) && info.currentSegment === 0

    return {
        canJoinGame,
        joinGame: async () => {
            if (contract) {
                const gasEstimate = await contract.methods
                    .joinGame()
                    .estimateGas({
                        from: account,
                    })
                    .catch(() => gasPrice)
                await contract.methods.joinGame().send({
                    from: account,
                    gasPrice: gasEstimate,
                })
            }
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
                await contract.methods.makeDeposit().send({
                    from: account,
                    gas: gasEstimate,
                    gasPrice,
                })
            }
        },
    }
}

export function useWithdraw(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract(info.contractAddress)
    const gasPrice = useGasPrice()

    const canWithdraw = info.currentPlayer && !info.currentPlayer.withdrawn && info.currentSegment >= info.lastSegment

    return {
        canWithdraw,
        withdraw: async () => {
            if (contract) {
                const gasEstimate = await contract.methods.withdraw().estimateGas({
                    from: account,
                })
                await contract.methods.withdraw().send({
                    from: account,
                    gas: gasEstimate,
                    gasPrice,
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
                await contract.methods.earlyWithdraw().send({
                    from: account,
                    gas: gasEstimate,
                    gasPrice,
                })
            }
        },
    }
}
