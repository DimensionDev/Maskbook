import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Stack } from '@mui/material'
import { memo } from 'react'
import { Platform } from '../types'

interface Item {
    platform: Platform
    identity: string
}

export const BindingItem = memo<Item>(({ platform, identity }) => {
    if (platform === Platform.ethereum) {
        return (
            <Stack direction="row">
                <Box>{formatEthereumAddress(identity, 4)}</Box>
            </Stack>
        )
    }

    return null
})
