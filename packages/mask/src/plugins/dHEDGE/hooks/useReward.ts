import { useAsync } from 'react-use'
import { API_URL } from '../constants'
import { PluginDHedgeRPC } from '../messages'

export function useRewards() {
    return useAsync(async () => {
        const reward = await PluginDHedgeRPC.fetchReward(API_URL)
        return reward
    })
}
