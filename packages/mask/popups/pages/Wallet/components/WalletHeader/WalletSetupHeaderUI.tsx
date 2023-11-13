import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useLocation, useNavigate } from 'react-router-dom'

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
            theme.palette.mode === 'light' ?
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)'
            :   theme.palette.maskColor.bottom,
        lineHeight: 0,
    },
    backIcon: {
        position: 'absolute',
        top: 16,
        left: 16,
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
}))

interface WalletSetupHeaderUIProps {
    showBack?: boolean
}

export const WalletSetupHeaderUI = memo<WalletSetupHeaderUIProps>(function WalletSetupHeaderUI({ showBack }) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const handleBack = useCallback(() => navigate(-1), [location])

    return (
        <Box className={classes.container}>
            {showBack ?
                <Icons.Comeback className={classes.backIcon} onClick={handleBack} />
            :   null}
            <Icons.MaskWallet width={64} height={64} />
        </Box>
    )
})
