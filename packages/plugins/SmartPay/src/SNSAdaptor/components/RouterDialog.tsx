import { Icons } from '@masknet/icons'
import {
    useAllPersonas,
    useCurrentPersonaInformation,
    useLastRecognizedIdentity,
} from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { SmartPayBundler, SmartPayFunder, SmartPayOwner } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { DialogContent, CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import { compact } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import { matchPath, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useUpdateEffect } from 'react-use'
import { RoutePaths } from '../../constants.js'
import { SmartPayContext } from '../../hooks/useSmartPayContext.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'
import { Deploy } from './Deploy.js'
import { InEligibilityTips } from './InEligibilityTips.js'
import { SmartPayContent } from './SmartPayContent.js'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: 0,
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
    const { classes } = useStyles()
    const { pathname, state } = useLocation()
    const navigate = useNavigate()
    const personas = useAllPersonas()
    const wallets = useWallets()
    const currentPersona = useCurrentPersonaInformation()

    const { signer, setSigner } = SmartPayContext.useContainer()

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

    const lastRecognizedIdentity = useLastRecognizedIdentity()

    // #region query white list
    const { loading: queryVerifyLoading } = useAsync(async () => {
        if (!lastRecognizedIdentity?.identifier?.userId) return
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
    }, [state])

    useUpdateEffect(() => {
        if (
            (signer?.signPersona &&
                currentPersona?.identifier.publicKeyAsHex !== signer.signPersona.identifier.publicKeyAsHex) ||
            (signer?.signWallet && !wallets.some((x) => isSameAddress(x.address, signer.signWallet?.address)))
        ) {
            closeDialog()
        }
    }, [currentPersona, signer, wallets])

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={title}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {queryVerifyLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={448}>
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
