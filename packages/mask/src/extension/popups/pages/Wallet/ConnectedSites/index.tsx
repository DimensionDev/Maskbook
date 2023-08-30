import { memo } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import SiteCard from '../components/SiteCard/index.js'
import { useConnectedSites } from '../../../hooks/useConnectedSites.js'

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

const ConnectedSites = memo(function ConnectedSites() {
    const { t } = useI18N()
    const { classes } = useStyles()
    useTitle(t('popups_wallet_connected_sites'))
    const { data: sites } = useConnectedSites()
    return (
        <Box className={classes.container}>
            <Typography className={classes.desc}>{t('popups_wallet_connected_sites_description')}</Typography>
            <Box className={classes.cardList}>{sites?.map((site) => <SiteCard key={site} site={site} />)}</Box>
        </Box>
    )
})

export default ConnectedSites
