import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { SmartPayFunder } from '@masknet/web3-providers'
import { DialogContent, CircularProgress, Box } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { useI18N } from '../../locales/index.js'
import { PluginSmartPayMessages } from '../../message.js'
import { Deploy } from './Deploy.js'
import { InEligibilityTips } from './InEligibilityTips.js'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { SmartPayContent } from './SmartPayContent.js'
import { useWallets } from '@masknet/web3-hooks-base'
import type { PersonaInformation } from '@masknet/shared-base'
import type { Wallet } from '@masknet/web3-shared-base'

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

export const SmartPayDialog = memo(() => {
    const t = useI18N()
    const [hasAccounts, setHasAccounts] = useState(false)
    const [signer, setSigner] = useState<
        | {
              signWallet?: Wallet
              signPersona?: PersonaInformation
          }
        | undefined
    >()
    // const [signWallet, setSignWallet] = useState<Wallet | undefined>()
    // const [signPersona, setSignPersona] = useState<PersonaInformation | undefined>()
    const { classes } = useStyles()
    const wallets = useWallets()

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

    const entries = [RoutePaths.Deploy, RoutePaths.InEligibility, RoutePaths.Main]

    const initialIndex = useMemo(() => {
        if (isVerified) {
            if (wallets.filter((x) => x.owner).length || hasAccounts) return 2
            return 0
        }

        return 1
    }, [isVerified, wallets, hasAccounts])

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.smart_pay_wallet()}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {queryVerifyLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={448}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
                        <Routes>
                            <Route
                                path={RoutePaths.Deploy}
                                element={
                                    <Deploy
                                        open={open}
                                        signPersona={signer?.signPersona}
                                        signWallet={signer?.signWallet}
                                    />
                                }
                            />
                            <Route path={RoutePaths.InEligibility} element={<InEligibilityTips />} />
                            <Route path={RoutePaths.Main} element={<SmartPayContent />} />
                        </Routes>
                    </MemoryRouter>
                )}
            </DialogContent>
        </InjectedDialog>
    )
})
