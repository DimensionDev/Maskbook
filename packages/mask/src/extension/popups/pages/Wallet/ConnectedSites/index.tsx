import { memo } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import SiteCard from '../components/SiteCard/index.js'
import { useConnectedSites } from '../../../hooks/useConnectedSites.js'
import { EmptyStatus } from '@masknet/shared'
import { useWallet } from '@masknet/web3-hooks-base'

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
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        whiteSpace: 'nowrap',
    },
}))

const ConnectedSites = memo(function ConnectedSites() {
    const { t } = useI18N()
    const { classes } = useStyles()
    useTitle(t('popups_wallet_connected_sites'))
    const wallet = useWallet()
    console.log(wallet)
    const { data: sites } = useConnectedSites()
    console.log(sites, 'aaa')
    return (
        <Box className={classes.container}>
            {sites?.length ? (
                <>
                    <Typography className={classes.desc}>
                        {t('popups_wallet_connected_sites_description', { name: wallet.name })}
                    </Typography>
                    <Box className={classes.cardList}>{sites?.map((site) => <SiteCard key={site} site={site} />)}</Box>
                </>
            ) : (
                <EmptyStatus className={classes.empty}>{t('popups_wallet_connected_sites_empty')}</EmptyStatus>
            )}
        </Box>
    )
})

export default ConnectedSites
