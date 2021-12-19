import { useAsync } from 'react-use'
import utils from '../../apis/utils'

export function useDonations() {
    const { value: donations = [], loading } = useAsync(async () => {
        const { listed } = await utils.initAssets('Gitcoin-Donation')
        return listed
    }, [])

    return {
        donations,
        loading,
    }
}
