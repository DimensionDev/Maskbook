import { DashboardRoutes } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Messages, Services } from '../../../API.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { PersonaContext } from '../../../pages/Personas/hooks/usePersonaContext.js'
import { BackupPreview } from '../../../pages/Settings/components/BackupPreview.js'
import { UserContext } from '../../../pages/Settings/hooks/UserContext.js'
import { AccountType } from '../../../pages/Settings/type.js'
import { ConfirmSynchronizePasswordDialog } from '../ConfirmSynchronizePasswordDialog.js'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { RestoreContext } from './CloudRestoreProvider.js'
import { RestoreStep } from './restoreReducer.js'
import { InputForm } from './InputForm.js'
import { ConfirmBackupInfo } from './ConfirmBackupInfo.js'

interface RestoreProps {
    onRestore: () => Promise<void>
}

const Restore = memo(function Restore({ onRestore }: RestoreProps) {
    const t = useDashboardI18N()
    const { fillSubmitOutlet } = usePersonaRecovery()
    const { state } = RestoreContext.useContainer()

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton size="large" color="primary" onClick={onRestore} loading={state.loading}>
                {t.restore()}
            </PrimaryButton>,
        )
    }, [onRestore, state.loading])

    if (!state.backupSummary) return null

    return <BackupPreview info={state.backupSummary} />
})

const RestoreFromCloudInner = memo(function RestoreFromCloudInner() {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { user, updateUser } = useContext(UserContext)
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()
    const { state } = RestoreContext.useContainer()
    const { account, accountType, backupSummary, backupSummaryId, password } = state

    const [openSynchronizePasswordDialog, toggleSynchronizePasswordDialog] = useState(false)

    const restoreCallback = useCallback(async () => {
        if (!currentPersona) {
            const lastedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastedPersona) {
                await changeCurrentPersona(lastedPersona)
            }
        }
        if (account) {
            if (!user.email && accountType === AccountType.Email) {
                updateUser({ email: account })
            } else if (!user.phone) {
                updateUser({ phone: account })
            }
        }
        toggleSynchronizePasswordDialog(true)
    }, [currentPersona, account, accountType, user, toggleSynchronizePasswordDialog])

    const handleRestore = useCallback(async () => {
        try {
            if (backupSummary?.wallets) {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupSummaryId, action: 'wallet' })
                return
            } else {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupSummaryId, action: 'confirm' })
                await restoreCallback()
            }
            navigate(DashboardRoutes.SignUpPersonaOnboarding, { replace: true })
        } catch {
            showSnackbar(t.sign_in_account_cloud_restore_failed(), { variant: 'error' })
        }
    }, [user, backupSummary, backupSummaryId])

    const onCloseSynchronizePassword = useCallback(() => {
        toggleSynchronizePasswordDialog(false)
        navigate(DashboardRoutes.Personas, { replace: true })
    }, [navigate])

    const synchronizePassword = useCallback(() => {
        if (!account || !password) return
        updateUser({ backupPassword: password })
        onCloseSynchronizePassword()
    }, [account, password])

    useEffect(() => {
        return Messages.events.restoreSuccess.on(restoreCallback)
    }, [restoreCallback])

    return (
        <Box width="100%">
            {[RestoreStep.InputEmail, RestoreStep.InputPhone].includes(state.step) ? (
                <InputForm />
            ) : state.step === RestoreStep.Decrypt ? (
                <ConfirmBackupInfo />
            ) : (
                <Restore onRestore={handleRestore} />
            )}
            {openSynchronizePasswordDialog ? (
                <ConfirmSynchronizePasswordDialog
                    open={openSynchronizePasswordDialog}
                    onClose={() => onCloseSynchronizePassword()}
                    onConform={synchronizePassword}
                />
            ) : null}
        </Box>
    )
})

export const RestoreFromCloud = memo(function RestoreFromCloud() {
    return (
        <RestoreContext.Provider>
            <RestoreFromCloudInner />
        </RestoreContext.Provider>
    )
})
