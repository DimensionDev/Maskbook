import { Icons } from '@masknet/icons'
import { useCurrentPersonaInformation, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import type { PersonaInformation } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { SmartPayFunder } from '@masknet/web3-providers'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { DialogContent, CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import { useMemo, useState } from 'react'
import { matchPath, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useUpdateEffect } from 'react-use'
import { RoutePaths } from '../../constants.js'
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
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const wallets = useWallets()
    const currentPersona = useCurrentPersonaInformation()
    const [hasAccounts, setHasAccounts] = useState(false)
    const [signer, setSigner] = useState<
        | {
              signWallet?: Wallet
              signPersona?: PersonaInformation
          }
        | undefined
    >()
    const { setDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)

    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent, (ev) => {
        // reset state when dialog has been closed
        if (!ev.open) {
            setHasAccounts(false)
            setSigner(undefined)
        }
        setHasAccounts(!!ev.hasAccounts)
        setSigner({
            signWallet: ev.signWallet,
            signPersona: ev.signPersona,
        })
    })

    const lastRecognizedIdentity = useLastRecognizedIdentity()

    // #region query white list
    const { value: isVerified, loading: queryVerifyLoading } = useAsync(async () => {
        if (!lastRecognizedIdentity?.identifier?.userId) return false
        return SmartPayFunder.verify(lastRecognizedIdentity.identifier.userId)
    }, [open, lastRecognizedIdentity])
    // #endregion

    const title = useMemo(() => {
        if (matchPath(RoutePaths.Deploy, pathname)) return t.smart_pay_wallet_deployment()
        else if (matchPath(RoutePaths.InEligibility, pathname)) return t.smart_pay_wallet()
        return t.__plugin_name()
    }, [matchPath, pathname])

    useUpdateEffect(() => {
        if (isVerified) {
            if (wallets.filter((x) => x.owner).length || hasAccounts) {
                return navigate(RoutePaths.Main)
            }
            return navigate(RoutePaths.Deploy)
        }
        return navigate(RoutePaths.InEligibility)
    }, [isVerified, wallets, hasAccounts])

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
            onClose={closeDialog}
            title={title}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {queryVerifyLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={448}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Routes>
                        <Route
                            path={RoutePaths.Deploy}
                            element={
                                <Deploy open={open} signPersona={signer?.signPersona} signWallet={signer?.signWallet} />
                            }
                        />
                        <Route path={RoutePaths.InEligibility} element={<InEligibilityTips />} />
                        <Route path={RoutePaths.Main} element={<SmartPayContent />} />
                    </Routes>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
