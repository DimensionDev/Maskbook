import { NewLinkOutIcon, PluginIcon, VerifyIcon, WalletUnderTabsIcon, Web3ProfileIcon } from '@masknet/icons'
import { PluginId, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import type { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useAsync, useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { TAB_SELECTOR } from '../constants'
import { useI18N } from '../locales'
import { BindDialog } from './BindDialog'

const useStyles = makeStyles()((theme) => ({
    tip: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        // backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: 700,
        fontSize: '16px',
        color: '#07101B',
        display: 'flex',
    },
    longBar: {
        width: '103px',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        marginBottom: '4px',
        boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.05)',
    },
    middleBar: {
        width: '68px',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        marginBottom: '4px',
        boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.05)',
    },
    shortBar: {
        width: '49px',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        marginBottom: '4px',
        boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.05)',
    },
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF;',
        borderRadius: '16px',
        padding: '14px',
    },
    verifyIntro: {
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '12px',
    },
    verifyDetail: {
        fontSize: '14px',
        fontWeight: 400,
        color: theme.palette.grey[700],
    },
    verifyInstruction: {
        fontSize: '14px',
        fontWeight: 400,
        color: theme.palette.grey[700],
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '196px',
    },
}))

interface NextIdPageProps {
    persona: string
}

export function NextIdPage({ persona }: NextIdPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const personaConnectStatus = usePersonaConnectStatus()
    const { reset, isVerified } = useNextIDConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const personaActionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null
        const button = personaConnectStatus.hasPersona ? t.connect_persona() : t.create_persona()
        return <Button onClick={personaConnectStatus.action}>{button}</Button>
    }, [personaConnectStatus, t])

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex

    const { value: isAccountVerified, loading: loadingVerifyInfo } = useAsync(async () => {
        if (!publicKeyAsHex) return
        if (!visitingPersonaIdentifier.identifier) return
        return NextIDProof.queryIsBound(publicKeyAsHex, platform, visitingPersonaIdentifier.identifier.userId)
    }, [publicKeyAsHex, visitingPersonaIdentifier, isVerified])

    const isWeb3ProfileDisable = useIsMinimalMode(PluginId.Web3Profile)

    const {
        value: bindings,
        loading: loadingBindings,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!publicKeyAsHex) return
        return NextIDProof.queryExistedBindingByPersona(publicKeyAsHex)
    }, [publicKeyAsHex])

    const onVerify = async () => {
        reset()
        const firstTab = TAB_SELECTOR?.[platform]?.evaluate()?.querySelector('div')?.parentNode
            ?.firstChild as HTMLElement
        firstTab.click()
    }

    const onEnablePlugin = async () => {
        await Services.Settings.setPluginMinimalModeEnabled(PluginId.Web3Profile, false)
    }

    const getButton = () => {
        if (isWeb3ProfileDisable) {
            return (
                <Button
                    style={{ borderRadius: '99px', backgroundColor: '#07101b', color: '#fff' }}
                    variant="contained"
                    onClick={onEnablePlugin}>
                    <PluginIcon fontSize="small" />
                    <Typography marginLeft="9px">{t.enable_plugin()}</Typography>
                </Button>
            )
        }
        if (personaActionButton && isOwn) {
            return personaActionButton
        }
        if (!isAccountVerified) {
            return (
                <Button
                    style={{ borderRadius: '99px', backgroundColor: '#07101b', color: '#fff' }}
                    variant="contained"
                    onClick={onVerify}>
                    <VerifyIcon />
                    {t.verify_Twitter_ID_button()}
                </Button>
            )
        }
        return (
            <Button
                style={{ borderRadius: '99px', backgroundColor: '#07101b', color: '#fff' }}
                variant="contained"
                onClick={() => toggleBindDialog(true)}>
                <WalletUnderTabsIcon />
                {t.verify_wallet_button()}
            </Button>
        )
    }

    if (loadingBindings || loadingPersona || loadingVerifyInfo) {
        return (
            <>
                {Array.from({ length: 2 })
                    .fill(0)
                    .map((_, i) => (
                        <div key={i}>
                            <Skeleton className={classes.skeleton} animation="wave" variant="rectangular" />
                        </div>
                    ))}
            </>
        )
    }

    if (!isAccountVerified && isOwn) {
        return (
            <Box>
                <Box className={classes.tip}>
                    <Typography className={classes.verifyIntro}>{t.verify_Twitter_ID_intro()}</Typography>
                    <Typography className={classes.verifyDetail}>{t.verify_Twitter_ID()}</Typography>
                </Box>

                <Stack justifyContent="center" direction="row" mt="24px">
                    <Button onClick={onVerify}>{t.verify_Twitter_ID_button()}</Button>
                </Stack>
            </Box>
        )
    }

    return (
        <>
            <Box className={classes.container}>
                <Box className={classes.header}>
                    <div className={classes.title}>
                        <div style={{ marginRight: '6px' }}>
                            <Web3ProfileIcon />
                        </div>
                        {t.web3_profile()}
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Typography sx={{ color: '#536471', fontSize: '14', fontWeight: 400 }}>Provided by</Typography>
                        <Typography sx={{ color: '#07101B', fontSize: '14', fontWeight: 500, marginLeft: '2px' }}>
                            {t.mask_network()}
                        </Typography>
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="textPrimary"
                            href="https://mask.io/"
                            width="22px"
                            height="22px"
                            style={{ alignSelf: 'center' }}>
                            <NewLinkOutIcon />
                        </Link>
                    </div>
                </Box>
                <div style={{ marginTop: '24px' }}>
                    <div className={classes.longBar} />
                    <div className={classes.middleBar} />
                    <div className={classes.shortBar} />
                </div>
                <Stack justifyContent="center" direction="row" mt="24px">
                    {getButton()}
                </Stack>
            </Box>
            {openBindDialog && currentPersona && isOwn && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={bindings?.proofs ?? []}
                    onBound={retryQueryBinding}
                />
            )}
        </>
    )
}
