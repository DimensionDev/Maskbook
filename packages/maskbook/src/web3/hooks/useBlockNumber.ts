import { useAsync } from 'react-use'
import Services from '../../extension/service'

export function useBlockNumber() {
    return useAsync(() => Services.Ethereum.getBlockNumber()).value
}
