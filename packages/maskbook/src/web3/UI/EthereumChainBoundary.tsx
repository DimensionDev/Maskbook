import { Typography } from '@material-ui/core'
import { ChainId, resolveChainName } from '@dimensiondev/web3-shared'
import { useChainId } from '../hooks/useChainId'

export interface EthereumChainBoundaryProps {
    chainId: ChainId
    children?: React.ReactNode
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const chainId = useChainId()
    if (chainId !== props.chainId)
        return <Typography color="textPrimary">Not available on {resolveChainName(chainId)}.</Typography>
    return <>{props.children}</>
}
