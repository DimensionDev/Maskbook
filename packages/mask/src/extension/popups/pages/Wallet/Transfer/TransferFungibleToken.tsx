import { Box } from '@mui/material'
import { memo } from 'react'
import { RecipientInput } from './RecipientInput.js'
import { TokenIcon } from '@masknet/shared'

export const TransferFungibleToken = memo(function TransferFungibleToken() {
    return (
        <Box>
            <RecipientInput />
            <div></div>
        </Box>
    )
})
