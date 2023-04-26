import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../locales/i18n_generated.js'
import { AirDropActivityItem } from './AirDropActivityItem.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
        minHeight: 392,
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 424,
        width: '100%',
        flexDirection: 'column',
    },
    tips: {
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export const AirDropActivities = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext()

    if (account) {
        return (
            <Box className={classes.container}>
                <AirDropActivityItem />
            </Box>
        )
    }
    return (
        <Box className={classes.placeholder}>
            <Icons.EmptySimple size={32} />
            <Typography className={classes.tips}>
                {!account ? t.connect_wallet_tips() : t.no_activities_tips()}
            </Typography>
        </Box>
    )
})
