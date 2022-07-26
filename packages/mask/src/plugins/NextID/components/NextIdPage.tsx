import { Plugin, WalletUnderTabs, Web3Profile, Connect, Identity, LinkOut } from '@masknet/icons'
import { PluginId, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NextIDPlatform, PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
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
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '196px',
    },
    web3Icon: {
        marginRight: 6,
        marginTop: 2,
    },
    item1: {
        color: '#767f8d',
        fontSize: '14px',
        fontWeight: 400,
    },
    item2: {
        color: '#07101B',
        fontSize: '14px',
        fontWeight: 500,
        marginLeft: '2px',
    },
    button: {
        borderRadius: '99px',
        backgroundColor: '#07101b',
        color: '#fff',
        marginTop: 'auto',
        ':hover': {
            color: 'fff',
            backgroundColor: '#07101b',
        },
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 400,
    },
}))

interface NextIdPageProps {
    persona?: string
}

export function NextIdPage({ persona }: NextIdPageProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [description, setDescription] = useState('')
    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const personaConnectStatus = usePersonaConnectStatus()
    const { reset, isVerified } = useNextIDConnectStatus()
    const chainId = useChainId()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const personaActionButton = useMemo(() => {
        if (!personaConnectStatus.action) return null
        const button = personaConnectStatus.hasPersona ? t.connect_persona() : t.create_persona()
        setDescription(personaConnectStatus.hasPersona ? '' : t.create_persona_intro())
        const icon = personaConnectStatus.hasPersona ? (
            <Connect sx={{ marginRight: '8px' }} />
        ) : (
            <Identity size={18} sx={{ marginRight: '8px' }} />
        )

        return (
            <Button className={classes.button} onClick={personaConnectStatus.action}>
                {icon}
                {button}
            </Button>
        )
    }, [personaConnectStatus, t])

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex

    const { value: isAccountVerified, loading: loadingVerifyInfo } = useAsync(async () => {
        if (!publicKeyAsHex) return
        if (!visitingPersonaIdentifier.identifier) return
        return NextIDProof.queryIsBound(
            publicKeyAsHex,
            platform,
            visitingPersonaIdentifier.identifier.userId?.toLowerCase(),
        )
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

    const handleAddWallets = () => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }

    const getButton = useMemo(() => {
        if (!isOwn) {
            setDescription(t.others_lack_wallet())
            return
        }
        if (isWeb3ProfileDisable) {
            return (
                <Button className={classes.button} variant="contained" onClick={onEnablePlugin}>
                    <Plugin />
                    <Typography marginLeft="9px">{t.enable_plugin()}</Typography>
                </Button>
            )
        }
        if (personaActionButton && isOwn) {
            return personaActionButton
        }
        if (!isAccountVerified && isOwn) {
            return (
                <Button className={classes.button} variant="contained" onClick={onVerify}>
                    <Connect sx={{ margin: '2px 8px 0 0' }} />
                    {t.verify_Twitter_ID_button()}
                </Button>
            )
        }
        setDescription(t.add_wallet_intro())
        return (
            <Button className={classes.button} variant="contained" onClick={handleAddWallets}>
                <WalletUnderTabs size={16} color="white" sx={{ marginRight: '8px' }} />
                {t.add_wallet_button()}
            </Button>
        )
    }, [isWeb3ProfileDisable, personaActionButton, isOwn, isAccountVerified, t])

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

    return (
        <>
            <Box className={classes.container}>
                <Box className={classes.header}>
                    <div className={classes.title}>
                        <Web3Profile className={classes.web3Icon} />
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
                            <LinkOut size={16} color="#767f8d" />
                        </Link>
                    </div>
                </Box>
                <Box className={classes.content}>{description}</Box>
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
