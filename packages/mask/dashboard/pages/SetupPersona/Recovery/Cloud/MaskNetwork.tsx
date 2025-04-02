import Services from '#services'
import { BackupAccountType, DashboardRoutes } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'

import { Trans } from '@lingui/react/macro'
import { Alert, PersonaContext } from '@masknet/shared'
import { UserContext } from '../../../../../shared-ui/index.js'
import { BackupPreview } from '../../../../components/BackupPreview/index.js'
import { OutletPortal } from '../../../../components/OutletPortal.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { ConfirmSynchronizePasswordDialog } from '../../../../components/Restore/ConfirmSynchronizePasswordDialog.js'
import { RestoreStep } from '../../../../components/Restore/RestoreFromCloud/restoreReducer.js'
import { ConfirmBackupInfo } from './ConfirmBackupInfo.js'
import { InputForm } from './InputForm.js'
import { RestoreContext } from './RestoreProvider.js'

const MaskNetworkInner = memo(function MaskNetworkInner() {
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { user, updateUser } = UserContext.useContainer()
    const { currentPersona } = PersonaContext.useContainer()
    const { state, dispatch } = RestoreContext.useContainer()
    const { account, accountType, backupSummary, password, backupDecrypted } = state

    const [openSynchronizePasswordDialog, toggleSynchronizePasswordDialog] = useState(false)

    const restoreCallback = useCallback(async () => {
        if (!currentPersona) {
            const lastedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastedPersona) {
                await Services.Settings.setCurrentPersonaIdentifier(lastedPersona)
            }
        }
        if (account) {
            if (!user.email && accountType === BackupAccountType.Email) {
                updateUser({ email: account })
            } else if (!user.phone) {
                updateUser({ phone: account })
            }
        }
        toggleSynchronizePasswordDialog(true)
    }, [currentPersona, account, accountType, user, toggleSynchronizePasswordDialog, updateUser])

    const handleRestore = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', loading: true })
        try {
            if (backupSummary?.countOfWallets) {
                const hasPassword = await Services.Wallet.hasPassword()
                if (!hasPassword) await Services.Wallet.setDefaultPassword()
            }

            await Services.Backup.restoreBackup(backupDecrypted)
            await restoreCallback()
            dispatch({ type: 'SET_LOADING', loading: false })
            navigate(urlcat(DashboardRoutes.SignUpPersonaOnboarding, { count: backupSummary?.countOfWallets }), {
                replace: true,
            })
        } catch {
            showSnackbar(<Trans>Restore failed</Trans>, { variant: 'error' })
        }
    }, [user, backupSummary])

    const onCloseSynchronizePassword = useCallback(() => {
        toggleSynchronizePasswordDialog(false)
        navigate(DashboardRoutes.Personas, { replace: true })
    }, [navigate])

    const synchronizePassword = useCallback(() => {
        if (!account || !password) return
        updateUser({ backupPassword: password })
        onCloseSynchronizePassword()
    }, [account, password, updateUser])

    const showButton = ![RestoreStep.InputEmail, RestoreStep.InputPhone, RestoreStep.Decrypt].includes(state.step)
    const [showAlert, setShowAlert] = useState(true)
    return (
        <Box width="100%">
            {[RestoreStep.InputEmail, RestoreStep.InputPhone].includes(state.step) ?
                <>
                    <InputForm />
                    <Alert mt={2} severity="warning" open={showAlert} onClose={() => setShowAlert(false)}>
                        <Trans>
                            The Mask Network Cloud Backup feature will be deactivated on April 30, 2025. Please use
                            alternative cloud backup services or local backup solutions.
                        </Trans>
                    </Alert>
                </>
            : state.step === RestoreStep.Decrypt ?
                <ConfirmBackupInfo />
            : state.backupSummary ?
                <BackupPreview info={state.backupSummary} />
            :   null}
            {openSynchronizePasswordDialog ?
                <ConfirmSynchronizePasswordDialog
                    open={openSynchronizePasswordDialog}
                    onClose={() => onCloseSynchronizePassword()}
                    onConform={synchronizePassword}
                />
            :   null}
            {showButton ?
                <OutletPortal>
                    <PrimaryButton
                        size="large"
                        color="primary"
                        variant="roundedContained"
                        onClick={handleRestore}
                        loading={state.loading}>
                        <Trans>Restore</Trans>
                    </PrimaryButton>
                </OutletPortal>
            :   null}
        </Box>
    )
})

export const Component = memo(function RestoreFromCloud() {
    return (
        <RestoreContext>
            <MaskNetworkInner />
        </RestoreContext>
    )
})
