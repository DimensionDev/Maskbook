import { memo } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import OriginCard from '../components/OriginCard/index.js'
import { useConnectedOrigins } from '../../../hooks/useConnectedOrigins.js'

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
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    useTitle(t.popups_wallet_connected_sites())
    const _ = useConnectedOrigins()
    const origins = _.data ? [..._.data].sort((a, b) => a.localeCompare(b, 'en-US')) : undefined

    return (
        <Box className={classes.container}>
            <Typography className={classes.desc}>{t.popups_wallet_connected_sites_description()}</Typography>
            <Box className={classes.cardList}>
                {origins?.map((origin) => <OriginCard key={origin} origin={origin} />)}
            </Box>
        </Box>
    )
})
