import { PluginId, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { NextIDPlatform, PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCurrentPersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../locales'
import { BindDialog } from './BindDialog'
import type { LiveSelector } from '@dimensiondev/holoflows-kit'
import { searchAllProfileTabSelector } from '../../../social-network-adaptor/twitter.com/utils/selector'
import { Icons } from '@masknet/icons'
import { PluginEnableBoundary } from '../../../components/shared/PluginEnableBoundary'
import { ConnectPersonaBoundary } from '../../../components/shared/ConnectPersonaBoundary'

const useStyles = makeStyles()((theme) => ({
    tip: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        borderRadius: 8,
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
        padding: '14px 14px 16px 14px ',
        height: '166px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '196px',
    },
    web3Icon: {
        marginRight: 6,
        marginTop: 2,
    },
    walletIcon: {
        marginRight: 8,
        color: theme.palette.maskColor.white,
    },
    item1: {
        color: theme.palette.maskColor.secondaryDark,
        fontSize: '14px',
        fontWeight: 400,
    },
    item2: {
        color: theme.palette.maskColor.dark,
        fontSize: '14px',
        fontWeight: 500,
        marginLeft: '2px',
    },
    button: {
        borderRadius: '99px',
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.maskColor.white,
        marginTop: 'auto',
        ':hover': {
            color: theme.palette.maskColor.white,
            backgroundColor: theme.palette.maskColor.dark,
        },
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 400,
    },
    linkOutIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
}))

interface NextIdPageProps {
    persona?: string
}

export const TAB_SELECTOR: { [key: string]: LiveSelector<HTMLElement, true> } = {
    twitter: searchAllProfileTabSelector(),
}

export function NextIdPage() {
    const t = useI18N()
    const { classes } = useStyles()

    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const { value: personaConnectStatus, loading: statusLoading } = useCurrentPersonaConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex

    const isWeb3ProfileDisable = useIsMinimalMode(PluginId.Web3Profile)

    const description = useMemo(() => {
        if (!isOwn) {
            return t.others_lack_wallet()
        }
        if (isWeb3ProfileDisable) return ''
        if (!personaConnectStatus.hasPersona) {
            return t.create_persona_intro()
        }
        if (personaConnectStatus.verified) {
            return t.add_wallet_intro()
        }
        return ''
    }, [personaConnectStatus, isOwn, t, isWeb3ProfileDisable])

    const {
        value: bindings,
        loading: loadingBindings,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!publicKeyAsHex) return
        return NextIDProof.queryExistedBindingByPersona(publicKeyAsHex)
    }, [publicKeyAsHex])

    const handleBeforeVerify = async () => {
        const firstTab = TAB_SELECTOR?.[platform]?.evaluate()?.querySelector('div')?.parentNode
            ?.firstChild as HTMLElement
        firstTab.click()
    }

    const handleAddWallets = () => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            internal: true,
        })
    }

    const getButton = useMemo(() => {
        if (!isOwn) return null

        return (
            <PluginEnableBoundary pluginId={PluginId.Web3Profile}>
                <ConnectPersonaBoundary handlerPosition="top-right" customHint beforeVerify={handleBeforeVerify}>
                    {(s) => {
                        if (!s.hasPersona)
                            return (
                                <Button disabled={statusLoading} className={classes.button}>
                                    <Icons.Identity size={18} sx={{ marginRight: '8px' }} />
                                    {t.create_persona()}
                                </Button>
                            )
                        if (!s.connected)
                            return (
                                <Button disabled={statusLoading} className={classes.button}>
                                    <Icons.Connect size={18} sx={{ marginRight: '8px' }} />
                                    {t.connect_persona()}
                                </Button>
                            )

                        if (!s.verified)
                            return (
                                <Button disabled={statusLoading} className={classes.button}>
                                    <Icons.Connect size={18} sx={{ marginRight: '8px' }} />
                                    {t.verify_Twitter_ID_button()}
                                </Button>
                            )

                        return (
                            <Button className={classes.button} variant="contained" onClick={handleAddWallets}>
                                <Icons.WalletUnderTabs size={16} className={classes.walletIcon} />
                                {t.add_wallet_button()}
                            </Button>
                        )
                    }}
                </ConnectPersonaBoundary>
            </PluginEnableBoundary>
        )
    }, [isOwn, t, statusLoading, handleBeforeVerify, handleAddWallets])

    if (loadingBindings || loadingPersona) {
        return (
            <div>
                <Skeleton className={classes.skeleton} animation="wave" variant="rectangular" />
            </div>
        )
    }

    return (
        <>
            <Box className={classes.container}>
                <Box className={classes.header}>
                    <div className={classes.title}>
                        <Icons.Web3Profile className={classes.web3Icon} />
                        <Typography fontSize={16} fontWeight={700}>
                            {t.web3_profile()}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Typography className={classes.item1}>{t.provided_by()}</Typography>
                        <Typography className={classes.item2}>{t.mask_network()}</Typography>
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="textPrimary"
                            href="https://mask.io/"
                            width="22px"
                            height="22px"
                            style={{ alignSelf: 'center', marginLeft: '4px' }}>
                            <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                        </Link>
                    </div>
                </Box>
                <Typography className={classes.content}>{description}</Typography>
                <Stack justifyContent="center" direction="row">
                    {getButton}
                </Stack>
            </Box>
            {openBindDialog && currentPersona && isOwn && (
                <BindDialog
                    open={openBindDialog}
                    onClose={() => toggleBindDialog(false)}
                    persona={currentPersona}
                    bounds={bindings?.proofs ?? EMPTY_LIST}
                    onBound={retryQueryBinding}
                />
            )}
        </>
    )
}
