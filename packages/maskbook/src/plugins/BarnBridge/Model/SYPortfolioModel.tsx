import { last } from 'lodash-es'
import urlcat from 'urlcat'
import { API_URL } from '../constants'
import { useAsyncRetry } from 'react-use'

export interface SYPortfolioModelData {
    seniorValue: number
    juniorValue: number
}

export function SmartYieldPortfolioModelGetData(walletAddress: string) {
    return useAsyncRetry(async () => {
        const response = await fetch(
            urlcat(API_URL, '/smartyield/users/:walletAddress/portfolio-value', { walletAddress }),
            {
                body: null,
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
            },
        )

        interface Payload<T> {
            data: T
        }

        const payload: Payload<SYPortfolioModelData[]> = await response.json()

        return last(payload.data) ?? { seniorValue: 0, juniorValue: 0 }
    }, [])
}
