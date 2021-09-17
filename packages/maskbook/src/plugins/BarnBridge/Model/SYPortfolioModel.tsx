import { last } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { currentAccountSettings } from '../../Wallet/settings'

export interface SYPortoflioModelData {
    seniorValue: number
    juniorValue: number
}

export function SmartYieldPortfolioModelGetData() {
    return useAsyncRetry(async () => {
        const walletAddress = currentAccountSettings.value
        const response = await fetch(
            `https://api.barnbridge.com/api/smartyield/users/${walletAddress}/portfolio-value`,
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

        const payload: Payload<SYPortoflioModelData[]> = await response.json()

        return last(payload.data) ?? { seniorValue: 0, juniorValue: 0 }
    }, [])
}
