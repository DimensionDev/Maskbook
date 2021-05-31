import { Typography } from '@material-ui/core'
import { ChainId, getChainName, useChainId } from '@dimensiondev/web3-shared'

export interface EthereumChainBoundaryProps {
    chainId: ChainId
    children?: React.ReactNode
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const chainId = useChainId()
    if (chainId !== props.chainId)
        return <Typography color="textPrimary">Not available on {getChainName(chainId)}.</Typography>
    return <>{props.children}</>
}
