import { useGasPrice } from '@masknet/web3-shared'
import { useRedPacketContract } from './useRedPacketContract'

export function useTransactionFee(contractVersion: number) {
    const gasPrice = useGasPrice()
    const result = useRedPacketContract(contractVersion)
}
