import { last } from 'lodash-es'
import { useAsyncRetry } from 'react-use'

export interface SYPortfolioModelData {
    seniorValue: number
    juniorValue: number
}

export function SmartYieldPortfolioModelGetData(walletAddress: string) {
    return useAsyncRetry(async () => {
        const response = await fetch(
            `https://api-v2.barnbridge.com/api/smartyield/users/${walletAddress}/portfolio-value`,
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
