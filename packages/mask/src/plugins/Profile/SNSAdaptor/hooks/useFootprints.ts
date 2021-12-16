import { useAsync } from 'react-use'
import utils from '../common/utils'

export function useFootprints() {
    const { value: footprints = [], loading } = useAsync(async () => {
        const { listed } = await utils.initAssets('POAP')
        return listed
    }, [])

    return {
        footprints,
        loading,
    }
}
