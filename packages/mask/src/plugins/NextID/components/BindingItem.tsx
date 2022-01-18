import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Stack } from '@mui/material'
import { memo } from 'react'
import { Platform } from '../types'
import { DeleteIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    trashIcon: {
        fontSize: 12,
        stroke: '#1C68F3',
        marginLeft: 6,
        cursor: 'pointer',
    },
}))
interface Item {
    platform: Platform
    identity: string
    onUnBind(): void
}

export const BindingItem = memo<Item>(({ platform, identity, onUnBind }) => {
    const { classes } = useStyles()
    if (platform === Platform.ethereum) {
        return (
            <Stack direction="row">
                <Box>{formatEthereumAddress(identity, 4)}</Box>
                <Box>
                    <DeleteIcon className={classes.trashIcon} onClick={onUnBind} />
                </Box>
            </Stack>
        )
    }

    return null
})
