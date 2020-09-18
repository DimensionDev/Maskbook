import React from 'react'
import { Chip } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { ChainId } from '../../web3/types'

export interface EthereumChainChipProps {
    chainId: ChainId
}

export function EthereumChainChip({ chainId }: EthereumChainChipProps) {
    return (
        <Chip
            size="small"
            label={resolveChainName(chainId)}
            icon={
                <FiberManualRecordIcon
                    style={{
                        color: resolveChainColor(chainId),
                    }}
                />
            }
        />
    )
}

function resolveChainColor(id: ChainId) {
    switch (id) {
        case ChainId.Mainnet:
            return 'rgb(41, 182, 175)'
        case ChainId.Ropsten:
            return 'rgb(255, 74, 141)'
        case ChainId.Kovan:
            return 'rgb(112, 87, 255)'
        case ChainId.Rinkeby:
            return 'rgb(246, 195, 67)'
        default:
            return 'silver'
    }
}

function resolveChainName(id: ChainId) {
    switch (id) {
        case ChainId.Mainnet:
            return 'Main Ethereum Network'
        case ChainId.Ropsten:
            return 'Ropsten Test Network'
        case ChainId.Kovan:
            return 'Kovan Test Network'
        case ChainId.Rinkeby:
            return 'Rinkeby Test Network'
        default:
            return 'Unknown Network'
    }
}
