import { PluginId } from '@masknet/plugin-infra/content-script'
import { PopupRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { Box, Link, Skeleton, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCurrentPersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { useI18N } from '../locales'
import { BindDialog } from './BindDialog'
import { Icons } from '@masknet/icons'
import { PluginEnableBoundary } from '../../../components/shared/PluginEnableBoundary'
import {
    AddWalletPersonaAction,
    CreatePersonaAction,
    OtherLackWalletAction,
    SelectConnectPersonaAction,
} from './Actions'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1.5),
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
        padding: '14px 14px 16px 14px ',
        minHeight: '166px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
    linkOutIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
}))

export function NextIdPage() {
    const t = useI18N()
    const { classes } = useStyles()

    const currentProfileIdentifier = useLastRecognizedIdentity()
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const { value: personaConnectStatus, loading: statusLoading } = useCurrentPersonaConnectStatus()

    const [openBindDialog, toggleBindDialog] = useState(false)
    const isOwn = currentProfileIdentifier.identifier === visitingPersonaIdentifier.identifier

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier, personaConnectStatus.hasPersona])
    const publicKeyAsHex = currentPersona?.identifier.publicKeyAsHex

    const {
        value: bindings,
        loading: loadingBindings,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!publicKeyAsHex) return
        return NextIDProof.queryExistedBindingByPersona(publicKeyAsHex)
    }, [publicKeyAsHex])

    const handleAddWallets = () => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            internal: true,
        })
    }

    const getActionComponent = useMemo(() => {
        if (!isOwn) return <OtherLackWalletAction />

        return (
            <PluginEnableBoundary pluginId={PluginId.Web3Profile}>
                {(() => {
                    if (!personaConnectStatus.hasPersona)
                        return (
                            <CreatePersonaAction
                                disabled={statusLoading}
                                onCreate={() => personaConnectStatus.action?.()}
                            />
                        )
                    if (!personaConnectStatus.connected || !personaConnectStatus.verified)
                        return <SelectConnectPersonaAction />

                    return <AddWalletPersonaAction disabled={statusLoading} onAddWallet={handleAddWallets} />
                })()}
            </PluginEnableBoundary>
        )
    }, [isOwn, t, statusLoading, handleAddWallets])

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
                {getActionComponent}
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
