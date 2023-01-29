import { Icons } from '@masknet/icons'
import { ChainBoundary, SocialIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ChainId } from '@masknet/web3-shared-evm'
import { alpha, Box, Button, Card, Link, Stack, Typography } from '@mui/material'
import { compact, uniq } from 'lodash-es'
import urlcat from 'urlcat'
import { useGrant } from './hooks/useGrant.js'
import { Translate, useI18N } from '../locales/i18n_generated.js'
import { useDonate } from './contexts/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1.5),
        maxHeight: 500,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        flexGrow: 1,
    },
    metas: {
        display: 'flex',
        marginTop: theme.spacing(1),
    },
    admin: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    link: {
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2.5),
    },
    network: {
        marginRight: theme.spacing(1.5),
    },
    title: {
        lineHeight: '22px',
        fontWeight: 'bold',
        fontSize: 18,
        flexGrow: 1,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    bold: {
        fontWeight: 'bold',
        color: theme.palette.maskColor.dark,
    },
    banner: {
        textAlign: 'center',
        img: {
            width: '100%',
            maxWidth: '100%',
            borderRadius: theme.spacing(1.5),
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
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineCamp: '4',
        WebkitBoxOrient: 'vertical',
    },
    button: {
        width: '100%',
    },
}))

export interface PreviewCardProps {
    grantId: string
}

export function PreviewCard(props: PreviewCardProps) {
    const t = useI18N()
    const { classes, theme } = useStyles()
    const { value: grant, error, loading, retry } = useGrant(props.grantId)

    // #region the donation dialog
    const openDonate = useDonate()

    if (loading)
        return (
            <Typography color="textPrimary" textAlign="center" sx={{ padding: 2 }}>
                <LoadingBase />
            </Typography>
        )
    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ padding: 1.5 }}>
                <Typography color="textPrimary">{t.go_wrong()}</Typography>
                <Button variant="roundedDark" onClick={retry}>
                    {t.retry()}
                </Button>
            </Box>
        )
    if (!grant) return null

    const twitters = uniq(compact([grant.twitter_handle_1, grant.twitter_handle_2])).map(
        (handle) => `https://twitter.com/${handle}`,
    )

    return (
        <Box className={classes.root}>
            <div className={classes.header}>
                <Icons.ETH className={classes.network} size={36} />
                <Stack flexGrow={1} overflow="auto">
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Typography variant="h1" className={classes.title} title={grant.title}>
                            {grant.title}
                        </Typography>
                        <Button
                            disableTouchRipple
                            color="success"
                            size="small"
                            sx={{
                                pointerEvents: 'none',
                                borderRadius: '32px',
                                backgroundColor: grant.active
                                    ? theme.palette.maskColor.success
                                    : alpha(theme.palette.maskColor.primary, 0.1),
                            }}>
                            {t.grant_status({ context: grant.active ? 'active' : 'closed' })}
                        </Button>
                    </Box>
                    <div className={classes.metas}>
                        <Typography color="second" fontSize={14}>
                            <Translate.total_raised
                                values={{
                                    amount: `$${grant.amount_received}`,
                                }}
                                components={{
                                    bold: <Typography component="span" className={classes.bold} />,
                                }}
                            />
                        </Typography>
                        <div className={classes.admin}>
                            <Typography>
                                <Translate.admin
                                    values={{ admin: grant.admin_profile.handle }}
                                    components={{
                                        bold: <Typography component="span" className={classes.bold} />,
                                    }}
                                />
                            </Typography>
                            {twitters.map((url) => (
                                <Link key={url} className={classes.link} target="_blank" href={url}>
                                    <SocialIcon url={url} size={16} />
                                </Link>
                            ))}
                            {grant.admin_profile.github_url ? (
                                <Link className={classes.link} href={grant.admin_profile.github_url} target="_blank">
                                    <SocialIcon url={grant.admin_profile.github_url} size={16} />
                                </Link>
                            ) : null}
                            <Link className={classes.link} href={grant.admin_profile.url}>
                                <SocialIcon url={grant.admin_profile.url} size={16} />
                            </Link>
                        </div>
                    </div>
                </Stack>
            </div>
            <Card variant="outlined" className={classes.main} elevation={0}>
                <div className={classes.banner}>
                    <img src={grant.logo_url} />
                </div>
                <div className={classes.description}>
                    <Typography variant="body2" color="textSecondary" className={classes.text}>
                        {grant.description}
                    </Typography>
                </div>
                <div className={classes.data}>
                    <div className={classes.meta}>
                        <Typography variant="body2" color="textSecondary">
                            {t.last_updated()} {grant.last_update_natural}
                        </Typography>
                    </div>
                </div>
            </Card>
            <Box sx={{ display: 'flex', width: '100%' }}>
                <Box sx={{ flex: 1, padding: '12px 5px' }}>
                    <Button
                        fullWidth
                        variant="roundedDark"
                        className={classes.button}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={urlcat('https://gitcoin.co', grant.url)}
                        startIcon={<Icons.Eye variant="dark" size={18} />}>
                        {t.view_on()}
                    </Button>
                </Box>
                {grant.active ? (
                    <Box sx={{ flex: 1, padding: '12px 5px' }}>
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={ChainId.Mainnet}
                            predicate={(pluginID, chainId) =>
                                pluginID === NetworkPluginID.PLUGIN_EVM &&
                                [ChainId.Mainnet, ChainId.Matic].includes(chainId)
                            }
                            ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                            <Button
                                fullWidth
                                variant="roundedDark"
                                onClick={() => openDonate({ grant })}
                                startIcon={<Icons.ConnectWallet size={18} />}>
                                {t.donate()}
                            </Button>
                        </ChainBoundary>
                    </Box>
                ) : null}
            </Box>
        </Box>
    )
}
