import { useCallback } from 'react'
import urlcat from 'urlcat'
import { Box, Card, Typography, Button, Avatar, CircularProgress, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useI18N as useBaseI18N } from '../../../utils'
import { useI18N } from '../locales'
import { useGrant } from '../hooks/useGrant'
import { PluginGitcoinMessages } from '../messages'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

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
        width: '100%',
        margin: 0,
    },
    verified: {
        borderRadius: 50,
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
    button: {
        backgroundColor: theme.palette.maskColor?.dark,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.maskColor?.dark,
        },
        width: '100%',
    },
}))

export interface PreviewCardProps {
    id: string
}

export function PreviewCard(props: PreviewCardProps) {
    const t = useI18N()
    const { t: tr } = useBaseI18N()
    const { classes } = useStyles()
    const { value: grant, error, loading, retry } = useGrant(props.id)
    const theme = useTheme()

    // #region the donation dialog
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
    // #endregion

    if (loading)
        return (
            <Typography color="textPrimary" textAlign="center" sx={{ padding: 2 }}>
                <CircularProgress />
            </Typography>
        )
    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ padding: 1.5 }}>
                <Typography color="textPrimary">{tr('go_wrong')}</Typography>
                <Button
                    sx={{
                        backgroundColor: theme.palette.maskColor?.dark,
                        '&:hover': {
                            backgroundColor: theme.palette.maskColor?.dark,
                        },
                        width: 254,
                        color: 'white',
                    }}
                    onClick={retry}>
                    {tr('retry')}
                </Button>
            </Box>
        )
    if (!grant) return null

    return (
        <>
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
                            {t.last_updated()} {grant.last_update_natural}
                        </Typography>
                    </div>
                    <div className={classes.meta}>
                        <Typography variant="body2" color="textSecondary">
                            {t.by()}
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
            </Card>
            <Box sx={{ display: 'flex', width: '100%' }}>
                <Box sx={{ flex: 1, padding: 1.5 }}>
                    <Button
                        fullWidth
                        className={classes.button}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={urlcat('https://gitcoin.co', grant.url)}>
                        {t.view_on()}
                    </Button>
                </Box>
                <Box sx={{ flex: 1, padding: 1.5 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={ChainId.Mainnet}
                        predicate={(pluginID, chainId) =>
                            pluginID === NetworkPluginID.PLUGIN_EVM &&
                            [ChainId.Mainnet, ChainId.Matic].includes(chainId)
                        }
                        renderInTimeline>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: theme.palette.maskColor?.dark,
                                '&:hover': {
                                    backgroundColor: theme.palette.maskColor?.dark,
                                },
                                color: 'white',
                            }}
                            onClick={onDonate}>
                            {t.donate()}
                        </Button>
                    </ChainBoundary>
                </Box>
            </Box>
        </>
    )
}
