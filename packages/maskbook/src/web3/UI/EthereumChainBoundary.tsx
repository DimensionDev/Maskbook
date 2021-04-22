import { Typography } from '@material-ui/core'
import { useChainId } from '../hooks/useChainState'
import { resolveChainName } from '../pipes'
import type { ChainId } from '../types'

export interface EthereumChainBoundaryProps {
    chainId: ChainId
    children?: React.ReactNode
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const chainId = useChainId()

    if (chainId !== props.chainId) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>
    return <>{props.children}</>
}
