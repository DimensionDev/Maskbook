import { useAccount } from '../../../web3/hooks/useAccount'
import { useAllPoolsAsSeller } from '../hooks/useAllPoolsAsSeller'

export interface PoolListProps {}

export function PoolList(props: PoolListProps) {
    const account = useAccount()
    const pools = useAllPoolsAsSeller('0x66b57885e8e9d84742fabda0ce6e3496055b012d')

    console.log('DEBUG: pool list')
    console.log(pools)

    return null
}
