import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { formatEthereumAddress } from '../../Wallet/formatter'
import type { AirdropPacket } from '../apis'
import { useAirdropContract } from '../contracts/useAirdropContract'
import { PluginAirdropRPC } from '../messages'

export enum CheckStateType {
    UNKNOWN,
    PENDING,
    CLAIMED,
    YEP,
    NOPE,
    FAILED,
}

export type CheckState =
    | {
          type: CheckStateType.YEP | CheckStateType.NOPE
          packet: AirdropPacket
          start: number
          end: number
          ratio: BigNumber
          claimable: string
      }
    | {
          type: CheckStateType.UNKNOWN | CheckStateType.CLAIMED | CheckStateType.PENDING
      }
    | {
          type: CheckStateType.FAILED
          error: Error
      }

export function useCheckCallback() {
    const airdropContract = useAirdropContract()

    const [checkState, setCheckState] = useState<CheckState>({
        type: CheckStateType.UNKNOWN,
    })

    const checkCallback = useCallback(
        async (checkAddress?: string, checkByContract = true) => {
            if (!airdropContract || !checkAddress) return

            // validate address
            if (!EthereumAddress.isValid(checkAddress.trim())) {
                setCheckState({
                    type: CheckStateType.FAILED,
                    error: new Error('Not a valid address.'),
                })
                return
            }

            // clean previous packet at every pass
            setCheckState({
                type: CheckStateType.UNKNOWN,
            })

            // start check with remote apis
            setCheckState({
                type: CheckStateType.PENDING,
            })

            try {
                const address_ = formatEthereumAddress(checkAddress.trim())

                // read airdrop packet
                const packet = await PluginAirdropRPC.getMaskAirdropPacket(address_)
                if (!packet) {
                    setCheckState({
                        type: CheckStateType.FAILED,
                        error: new Error('No reward to claim.'),
                    })
                    return
                }

                // if only api verification is necessary
                if (!checkByContract) {
                    setCheckState({
                        type: CheckStateType.YEP,
                        packet,
                        start: 0,
                        end: new Date(2999, 1, 1).getTime(),
                        claimable: packet.amount,
                        ratio: new BigNumber(1),
                    })
                    return
                }

                // revalidate by contract
                const { index, address, amount, proof } = packet
                const { available, claimable, start, end } = await airdropContract.check(
                    index,
                    formatEthereumAddress(address),
                    amount,
                    proof,
                )

                const now = Date.now()
                const start_ = Number.parseInt(start) * 1000
                const end_ = Number.parseInt(end) * 1000
                const isStart = now >= start_
                const isEnd = now >= end_

                setCheckState({
                    type:
                        available && new BigNumber(claimable).isGreaterThan(0) && isStart && !isEnd
                            ? CheckStateType.YEP
                            : CheckStateType.NOPE,
                    packet,
                    start: start_,
                    end: end_,
                    claimable: available && new BigNumber(claimable).isGreaterThan(0) && !isEnd ? claimable : '0',
                    ratio: new BigNumber(claimable).dividedBy(amount),
                })
            } catch (error) {
                if (error.message.includes('Already Claimed')) {
                    setCheckState({
                        type: CheckStateType.CLAIMED,
                    })
                    return
                }
                setCheckState({
                    type: CheckStateType.FAILED,
                    error,
                })
            }
        },
        [airdropContract],
    )

    const resetCallback = useCallback(() => {
        setCheckState({
            type: CheckStateType.UNKNOWN,
        })
    }, [])

    return [checkState, checkCallback, resetCallback] as const
}
