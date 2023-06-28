import { Icons } from '@masknet/icons'
import { useAllPersonas, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { InjectedDialog, useRemoteControlledDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { SmartPayBundler, SmartPayFunder, SmartPayOwner } from '@masknet/web3-providers'
import { DialogContent, CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import { compact } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import { matchPath, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { RoutePaths } from '../../constants.js'
import { SmartPayContext } from '../../hooks/useSmartPayContext.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'
import { Deploy } from './Deploy.js'
import { InEligibilityTips } from './InEligibilityTips.js'
import { SmartPayContent } from './SmartPayContent.js'

const useStyles = makeStyles<{ isDeployPage: boolean }>()((theme, { isDeployPage }) => ({
    dialogContent: {
        padding: 0,
        overflow: isDeployPage ? 'hidden' : 'auto',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
}))

export function RouterDialog() {
    const t = useI18N()
    const { pathname, state } = useLocation()
    const { classes } = useStyles({ isDeployPage: Boolean(matchPath(RoutePaths.Deploy, pathname)) })
    const navigate = useNavigate()
    const personas = useAllPersonas()
    const wallets = useWallets()

    const { setSigner } = SmartPayContext.useContainer()

    const { setDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)

    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent, (ev) => {
        // reset state when dialog has been closed
        if (!ev.open) {
            setSigner(undefined)
        }

        setSigner({
            signWallet: ev.signWallet,
            signPersona: ev.signPersona,
        })
    })

    const { open: openOfCross, closeDialog: closeOfCross } = useRemoteControlledDialog(
        CrossIsolationMessages.events.smartPayDialogEvent,
    )

    const lastRecognizedIdentity = useLastRecognizedIdentity()

    // #region query white list
    const { loading: queryVerifyLoading } = useAsync(async () => {
        if (!lastRecognizedIdentity?.identifier?.userId || !open) return
        const chainId = await SmartPayBundler.getSupportedChainId()
        const accounts = await SmartPayOwner.getAccountsByOwners(chainId, [
            ...wallets.filter((x) => !x.owner).map((x) => x.address),
            ...compact(personas.map((x) => x.address)),
        ])
        const verified = await SmartPayFunder.verify(lastRecognizedIdentity.identifier.userId)

        if (accounts.filter((x) => x.deployed).length) return navigate(RoutePaths.Main)

        if (verified || accounts.filter((x) => !x.deployed && x.funded).length) return navigate(RoutePaths.Deploy)

        return navigate(RoutePaths.InEligibility)
    }, [open, lastRecognizedIdentity, personas.length, wallets.length])
    // #endregion

    const title = useMemo(() => {
        if (matchPath(RoutePaths.Deploy, pathname)) return t.smart_pay_wallet_deployment()
        else if (matchPath(RoutePaths.InEligibility, pathname)) return t.smart_pay_wallet()
        return t.__plugin_name()
    }, [matchPath, pathname])

    const handleClose = useCallback(() => {
        if (state?.canBack) return navigate(-1)
        closeDialog()
        closeOfCross()
    }, [state])

    return (
        <InjectedDialog
            open={open || openOfCross}
            onClose={handleClose}
            title={title}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {queryVerifyLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={564}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Routes>
                        <Route path={RoutePaths.Deploy} element={<Deploy open={open} />} />
                        <Route path={RoutePaths.InEligibility} element={<InEligibilityTips />} />
                        <Route path={RoutePaths.Main} element={<SmartPayContent />} />
                    </Routes>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
