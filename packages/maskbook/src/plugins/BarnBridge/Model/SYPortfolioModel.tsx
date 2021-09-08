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

        if (realData.data.length > 0) {
            const data = realData.data[realData.data.length - 1]
            return {
                seniorValue: data.seniorValue,
                juniorValue: data.juniorValue,
            }
        } else {
            return {
                seniorValue: 0,
                juniorValue: 0,
            }
        }
    }, [])
}
