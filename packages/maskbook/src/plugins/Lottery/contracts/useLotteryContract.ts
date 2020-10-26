import type { AbiItem } from 'web3-utils'
import { useConstant } from '../../../web3/hooks/useConstant'
import { LOTTERY_CONSTANTS } from '../constants'
import { useContract } from '../../../web3/hooks/useContract'
import type { LuckyLottery } from '../../../contracts/lucky-lottery/LuckyLottery'
import LuckyLotteryABI from '../../../contracts/lucky-lottery/LuckyLottery.json'

export function useLotteryContract() {
    const address = useConstant(LOTTERY_CONSTANTS, 'LUCKY_LOTTERY_ADDRESS')
    return useContract<LuckyLottery>(address, LuckyLotteryABI as AbiItem[]) as LuckyLottery
}
