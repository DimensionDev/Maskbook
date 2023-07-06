import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        height: 140,
        padding: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        alignSelf: 'stretch',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        lineHeight: 0,
    },
}))

interface WalletSetupHeaderUIProps {}

export const WalletSetupHeaderUI = memo<WalletSetupHeaderUIProps>(function WalletSetupHeaderUI() {
    const { classes } = useStyles()

    return (
        <Box className={classes.container}>
            <Icons.MaskWallet width={64} height={64} />
        </Box>
    )
})
