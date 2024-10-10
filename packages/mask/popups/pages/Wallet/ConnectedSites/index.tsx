import { memo } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import OriginCard from '../components/OriginCard/index.js'
import { useConnectedOrigins } from '../../../hooks/useConnectedOrigins.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
    },
    desc: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 0',
    },
}))

export const Component = memo(function ConnectedSites() {
    const { _ } = useLingui()
    const { classes } = useStyles()
    useTitle(_(msg`Connected sites`))
    const _2 = useConnectedOrigins()
    const origins = _2.data ? [..._2.data].sort((a, b) => a.localeCompare(b, 'en-US')) : undefined

    return (
        <Box className={classes.container}>
            <Typography className={classes.desc}>
                <Trans>Wallet name is connected to these sites, they can view your account address.</Trans>
            </Typography>
            <Box className={classes.cardList}>
                {origins?.map((origin) => <OriginCard key={origin} origin={origin} />)}
            </Box>
        </Box>
    )
})
