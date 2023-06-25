import { BigNumber } from 'bignumber.js'
import { intersection } from 'lodash-es'
import urlcat from 'urlcat'
import { useMemo } from 'react'
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { Icons } from '@masknet/icons'
import { ChainBoundary, LoadingStatus, ReloadStatus, SocialIcon } from '@masknet/shared'
import { NetworkPluginID, purify } from '@masknet/shared-base'
import { makeStyles, ShadowRootIsolation } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { alpha, Box, Button, Card, Link, Stack, Typography } from '@mui/material'
import { Translate, useI18N } from '../locales/i18n_generated.js'
import { SUPPORTED_TENANTS, TenantToChainIconMap } from '../constants.js'
import { useDonate } from './contexts/index.js'
import { grantDetailStyle } from './gitcoin-grant-detail-style.js'

import { useGrant } from './hooks/useGrant.js'
const useStyles = makeStyles()((theme) => ({
    card: {
        padding: theme.spacing(0, 1.5, 1.5),
        maxHeight: 500,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
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
        padding: theme.spacing(2, 2, 0),
        boxSizing: 'border-box',
        marginTop: theme.spacing(2.5),
        borderRadius: 12,
        minHeight: 366,
        display: 'flex',
        flexDirection: 'column',
    },
    article: {
        borderRadius: '12px 12px 0 0',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
        overscrollBehavior: 'contain',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
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
        marginRight: theme.spacing(2),
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
            maxHeight: 176,
            objectFit: 'cover',
            borderRadius: theme.spacing(1.5),
        },
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        tabSize: 4,
        img: {
            maxWidth: '100%',
        },
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
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region the donation dialog
    const openDonate = useDonate()

    const [style, description] = useMemo((): [string, string | TrustedHTML] => {
        if (!grant?.description_rich) return ['', grant?.description || '']
        const ops = JSON.parse(grant.description_rich).ops as object[]
        const converter = new QuillDeltaToHtmlConverter(ops)
        return [grantDetailStyle, converter.convert()]
    }, [grant?.description_rich, grant?.description])

    if (loading) return <LoadingStatus height={148} p={1} />
    if (error) return <ReloadStatus height={120} message={t.go_wrong()} onRetry={retry} />
    if (!grant) return null

    const tenant = grant.tenants[0]
    const isSupportedTenant = intersection(grant.tenants, SUPPORTED_TENANTS).length > 0

    // Use handle_1 as Gitcoin does
    const twitterProfile = grant.twitter_handle_1 ? `https://twitter.com/${grant.twitter_handle_1}` : null

    const ChainIcon = TenantToChainIconMap[tenant]
    return (
        <article className={classes.card}>
            <div className={classes.header}>
                {ChainIcon ? <ChainIcon className={classes.network} size={36} /> : null}
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
                        <Typography color={theme.palette.maskColor.second} fontSize={14}>
                            <Translate.total_raised
                                values={{
                                    amount: `$${new BigNumber(grant.amount_received).toFixed(2)}`,
                                }}
                                components={{
                                    bold: <Typography component="span" className={classes.bold} />,
                                }}
                            />
                        </Typography>
                        <div className={classes.admin}>
                            <Typography color={theme.palette.maskColor.second}>
                                <Translate.admin
                                    values={{ admin: grant.admin_profile.handle }}
                                    components={{
                                        bold: (
                                            <Link
                                                className={classes.bold}
                                                target="_blank"
                                                href={`https://gitcoin.co/profile/${grant.admin_profile.handle}`}
                                            />
                                        ),
                                    }}
                                />
                            </Typography>
                            {twitterProfile ? (
                                <Link className={classes.link} target="_blank" href={twitterProfile}>
                                    <SocialIcon url={twitterProfile} size={16} />
                                </Link>
                            ) : null}
                            {grant.admin_profile.github_url ? (
                                <Link className={classes.link} href={grant.admin_profile.github_url} target="_blank">
                                    <SocialIcon url={grant.admin_profile.github_url} size={16} />
                                </Link>
                            ) : null}
                            <Link className={classes.link} href={grant.reference_url}>
                                <SocialIcon url={grant.reference_url} size={16} />
                            </Link>
                        </div>
                    </div>
                </Stack>
            </div>
            <Card variant="outlined" className={classes.main} elevation={0}>
                <Typography className={classes.article} component="div">
                    <div className={classes.banner}>
                        <img src={grant.logo_url} />
                    </div>
                    <ShadowRootIsolation>
                        <style>{style}</style>
                        <PreviewCardRender __html={description} />
                    </ShadowRootIsolation>
                    <div className={classes.data}>
                        <div className={classes.meta}>
                            <Typography variant="body2" color="textSecondary">
                                {t.last_updated()} {grant.last_update_natural}
                            </Typography>
                        </div>
                    </div>
                </Typography>
            </Card>
            <Box sx={{ display: 'flex', width: '100%', gap: 1, mt: 1 }}>
                <Box sx={{ flex: 1 }}>
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
                {grant.active && isSupportedTenant ? (
                    <Box sx={{ flex: 1 }}>
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={chainId}
                            predicate={(pluginID) => pluginID === NetworkPluginID.PLUGIN_EVM}
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
        </article>
    )
}

// Note: this extra component is used to make sure the useStyles call happens
// under the ShadowRootIsolation context.
function PreviewCardRender({ __html }: { __html: string | TrustedHTML }) {
    const { classes, cx } = useStyles()
    const safeHTML = useMemo(() => {
        if (typeof __html === 'string') return purify(__html)
        return __html
    }, [__html])
    // this is safe because purify has been called
    // eslint-disable-next-line react/no-danger
    return <div className={cx(classes.description, 'grant-detail')} dangerouslySetInnerHTML={{ __html: safeHTML }} />
}
