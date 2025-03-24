import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    tabContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
        borderRadius: theme.spacing(1, 1, 0, 0),
        overflow: 'hidden',
        marginBottom: 46,
    },
    radios: {
        flexDirection: 'row',
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-evenly',
    },
    radioContainer: {
        flexGrow: 1,
        '& label': {
            cursor: 'pointer',
        },
    },
    panelContainer: {
        padding: theme.spacing(2),
    },
}))

export const GoogleDriveBackup = memo(function GoogleDriveBackup() {
    return (
        <Box>
            <Box>
                <Typography>test@gmail.com</Typography>
                <Button variant="text">Switch other accounts</Button>
            </Box>
        </Box>
    )
})
