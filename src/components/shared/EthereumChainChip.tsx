import React from 'react'
import { Chip } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import type { ChainId } from '../../web3/types'
import { resolveChainName, resolveChainColor } from '../../web3/pipes'

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
