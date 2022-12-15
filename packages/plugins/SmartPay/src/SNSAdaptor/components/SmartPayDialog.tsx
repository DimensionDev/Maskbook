import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { SmartPayFunder } from '@masknet/web3-providers'
import { DialogContent, CircularProgress, Box } from '@mui/material'
import { memo, useMemo } from 'react'
import { useAsync } from 'react-use'
import { useContainer } from 'unstated-next'
import { SmartPayContext } from '../../context/SmartPayContext.js'
import { useI18N } from '../../locales/index.js'
import { PluginSmartPayMessages } from '../../message.js'
import { Deploy } from './Deploy.js'
import { InEligibilityTips } from './InEligibilityTips.js'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
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

export const SmartPayDialog = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()

    const { setDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const currentVisitingProfile = useLastRecognizedIdentity()

    const { loading: querySignableAccountsLoading, accounts } = useContainer(SmartPayContext)

    // #region query white list
    const { value: isVerify, loading: queryVerifyLoading } = useAsync(async () => {
        if (!currentVisitingProfile?.identifier?.userId) return false
        return SmartPayFunder.verify(currentVisitingProfile?.identifier?.userId)
    }, [open, currentVisitingProfile])
    // #endregion

    const entries = [RoutePaths.Deploy, RoutePaths.Ineligibility, RoutePaths.Main]

    const initialIndex = useMemo(() => {
        if (isVerify) {
            if (accounts?.length) return 2
            return 0
        }

        return 1
    }, [isVerify, accounts])

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.smart_pay_wallet()}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {querySignableAccountsLoading || queryVerifyLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={448}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
                        <Routes>
                            <Route path={RoutePaths.Deploy} element={<Deploy open={open} />} />
                            <Route path={RoutePaths.Ineligibility} element={<InEligibilityTips />} />
                            <Route path={RoutePaths.Main} element={<SmartPayContent />} />
                        </Routes>
                    </MemoryRouter>
                )}
            </DialogContent>
        </InjectedDialog>
    )
})
