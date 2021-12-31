import { useCallback } from 'react'
import { Box, Card, Typography, Button, Grid, Avatar } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useGrant } from '../hooks/useGrant'
import { PluginGitcoinMessages } from '../messages'
import urlcat from 'urlcat'
import { usePostLink } from '../../../components/DataSource/usePostInfo'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    logo: {
        textAlign: 'center',
        '& > *': {
            width: 'auto',
            height: 100,
        },
    },
    title: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& > :last-child': {
            marginTop: 4,
            marginLeft: 4,
        },
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    data: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    meta: {
        fontSize: 10,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    avatar: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        margin: theme.spacing(0, 1),
    },
    buttons: {
        padding: theme.spacing(4, 0, 0),
    },
    verified: {
        borderRadius: 50,
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '4',
        WebkitBoxOrient: 'vertical',
    },
}))

interface PreviewCardProps {
    id: string
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: grant, error, loading, retry } = useGrant(props.id)

    //#region the donation dialog
    const postLink = usePostLink()
    const { setDialog: setDonationDialog } = useRemoteControlledDialog(PluginGitcoinMessages.donationDialogUpdated)
    const onDonate = useCallback(() => {
        if (!grant) return
        setDonationDialog({
            open: true,
            address: grant.admin_address,
            title: grant.title,
            postLink,
        })
    }, [grant, setDonationDialog])
    //#endregion

    if (loading) return <Typography color="textPrimary">{t('loading')}</Typography>
    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">{t('go_wrong')}</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    {t('retry')}
                </Button>
            </Box>
        )
    if (!grant) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <div className={classes.logo}>
                <img src={grant.logo_url} />
            </div>
            <div className={classes.title}>
                <Typography variant="h6" color="textPrimary">
                    {grant.title}
                </Typography>
                {grant.verified ? <VerifiedUserIcon fontSize="small" color="primary" /> : null}
            </div>
            <div className={classes.description}>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    {grant.description}
                </Typography>
            </div>
            <div className={classes.data}>
                <div className={classes.meta}>
                    <QueryBuilderIcon fontSize="small" color="disabled" />
                    <Typography variant="body2" color="textSecondary">
                        {t('plugin_gitcoin_last_updated')} {grant.last_update_natural}
                    </Typography>
                </div>
                <div className={classes.meta}>
                    <Typography variant="body2" color="textSecondary">
                        {t('plugin_gitcoin_by')}
                    </Typography>
                    <Avatar
                        alt={grant.admin_profile.handle}
                        src={grant.admin_profile.avatar_url}
                        className={classes.avatar}
                    />
                    <Typography variant="body2" color="textSecondary">
                        {grant.admin_profile.handle}
                    </Typography>
                </div>
            </div>
            <Grid container className={classes.buttons} spacing={2}>
                <Grid item xs={6}>
                    <Button
                        variant="outlined"
                        fullWidth
                        color="primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={urlcat('https://gitcoin.co', grant.url)}>
                        {t('plugin_gitcoin_view_on')}
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" fullWidth color="primary" onClick={onDonate}>
                        {t('plugin_gitcoin_donate')}
                    </Button>
                </Grid>
            </Grid>
        </Card>
    )
}
