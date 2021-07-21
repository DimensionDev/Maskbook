import { useAccount } from '@masknet/web3-shared'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo } from '../types'
import { DAI } from '../constants'
import { useChainId, useERC20TokenContract, useGoodGhostingConstants } from '@masknet/web3-shared'
import { getPlayerStatus, PlayerStatus } from '../utils'

export function useJoinGame(info: GoodGhostingInfo) {
    const { GOOD_GHOSTING_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    const chainId = useChainId()
    const daiContract = useERC20TokenContract(DAI[chainId].address)
    const account = useAccount()
    const contract = useGoodGhostingContract()

    const canJoinGame = !info.currentPlayer && info.currentSegment === 0

    return {
        canJoinGame,
        joinGame: async () => {
            if (contract && daiContract) {
                await daiContract.methods.approve(GOOD_GHOSTING_CONTRACT_ADDRESS, info.segmentPayment).send({
                    from: account,
                })
                await contract.methods.joinGame().send({
                    from: account,
                })
            }
        },
    }
}

export function useMakeDeposit(info: GoodGhostingInfo) {
    const { GOOD_GHOSTING_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    const chainId = useChainId()
    const daiContract = useERC20TokenContract(DAI[chainId].address)
    const account = useAccount()
    const contract = useGoodGhostingContract()

    const status = getPlayerStatus(info.currentSegment, info.currentPlayer)
    const canMakeDeposit =
        info.currentPlayer &&
        info.currentSegment > 0 &&
        info.currentSegment < info.lastSegment - 1 &&
        status === PlayerStatus.Waiting

    return {
        canMakeDeposit,
        makeDeposit: async () => {
            if (contract && daiContract) {
                await daiContract.methods.approve(GOOD_GHOSTING_CONTRACT_ADDRESS, info.segmentPayment).send({
                    from: account,
                })
                await contract.methods.makeDeposit().send({
                    from: account,
                })
            }
        },
    }
}

export function useWithdraw(info: GoodGhostingInfo) {
    const account = useAccount()
    const contract = useGoodGhostingContract()

    const canWithdraw =
        info.currentPlayer &&
        Number.parseInt(info.currentPlayer.mostRecentSegmentPaid, 0) === info.lastSegment - 1 &&
        !info.currentPlayer.withdrawn &&
        info.currentSegment >= info.lastSegment

    return {
        canWithdraw,
        withdraw: async () => {
            if (contract) {
                await contract.methods.withdraw().send({
                    from: account,
                })
            }
        },
    }
}
