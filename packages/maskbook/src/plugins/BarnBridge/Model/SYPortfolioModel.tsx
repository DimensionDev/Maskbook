import { last } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { currentAccountSettings } from '../../Wallet/settings'

export function SmartYieldPortfolioModelGetData() {
    const protocolsMap: any = {}

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

        const realData = await response.json()

        return last(realData.data) ?? { seniorValue: 0, juniorValue: 0 }
    }, [])
}
