import { useCallback, useState } from 'react'
import { formatEthereumAddress } from '../../Wallet/formatter'
import { useAirdropContract } from '../contracts/useAirdropContract'
import { PluginAirdropRPC } from '../messages'

export enum CheckStateType {
    UNKNOWN,
    PENDING,
    SUCCEED,
    FAILED,
}

export function useCheckCallback() {
    const airdropContract = useAirdropContract()
    const [checkStateType, setCheckStateType] = useState(CheckStateType.UNKNOWN)

    const checkCallback = useCallback(
        async (checkAddress?: string) => {
            if (!airdropContract || !checkAddress) {
                setCheckStateType(CheckStateType.UNKNOWN)
                return
            }

            // skip if previous tx is pending
            if (checkStateType === CheckStateType.PENDING) return

            // start check with remote apis
            setCheckStateType(CheckStateType.PENDING)

            try {
                const address_ = formatEthereumAddress(checkAddress.trim())

                // read airdrop packet
                const packet = await PluginAirdropRPC.getAirdropPacket(address_)
                if (!packet) {
                    setCheckStateType(CheckStateType.FAILED)
                    return
                }

                // check on contract
                if (!airdropContract) {
                    setCheckStateType(CheckStateType.FAILED)
                    return
                }
                const { index, address, amount, proof } = packet
                const checked = await airdropContract.methods.check(index, address, amount, proof).call()
                setCheckStateType(checked ? CheckStateType.SUCCEED : CheckStateType.FAILED)
            } catch (e) {
                setCheckStateType(CheckStateType.FAILED)
            }
        },
        [airdropContract, checkStateType],
    )

    const resetCallback = useCallback(() => {
        setCheckStateType(CheckStateType.UNKNOWN)
    }, [])
    return [checkStateType, checkCallback, resetCallback] as const
}
