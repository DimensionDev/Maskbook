import React from 'react'
import { Chip } from '@material-ui/core'

export interface EthereumAccountChipProps {
    address: string
}

export function EthereumAccountChip({ address }: EthereumAccountChipProps) {
    const address_ = address.replace(/^0x/i, '')
    return <Chip size="small" label={`0x${address_.slice(0, 4)}...${address_.slice(-4)}`}></Chip>
}
