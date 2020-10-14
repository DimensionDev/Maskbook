import { useAsync, useAsyncRetry } from 'react-use'
import { useLotteryContract } from '../contracts/useLotteryContract'

export function useAvailability(account: string, id?: string) {
    const LotteryContract = useLotteryContract()
    return useAsync(async () => {
        if (!id) return null
        if (!LotteryContract) return null

        const p1 = LotteryContract.methods.check_lottery_state(id).call({ from: account })
        const p2 = LotteryContract.methods.check_lottery_basic_info(id).call({ from: account })
        const p3 = LotteryContract.methods.check_my_lottery(id).call({ from: account })
        const p4 = LotteryContract.methods.check_participator(id).call({ from: account })
        const p5 = LotteryContract.methods.check_winner_list(id).call({ from: account })
        return Promise.all([p1, p2, p3, p4, p5])
    }, [id, account, LotteryContract])
}

export function useAvailabilityRetry(account: string, id?: string) {
    const LotteryContract = useLotteryContract()
    return useAsyncRetry(async () => {
        if (!id) return
        if (!LotteryContract) return

        const p1 = LotteryContract.methods.check_lottery_state(id).call({ from: account })
        const p2 = LotteryContract.methods.check_lottery_basic_info(id).call({ from: account })
        const p3 = LotteryContract.methods.check_my_lottery(id).call({ from: account })
        const p4 = LotteryContract.methods.check_participator(id).call({ from: account })
        const p5 = LotteryContract.methods.check_winner_list(id).call({ from: account })
        return Promise.all([p1, p2, p3, p4, p5])
    }, [id, account, LotteryContract])
}
