import urlcat from 'urlcat'
import { memo, useCallback, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { DashboardRoutes, BackupAccountType } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import Services from '#services'

import { ConfirmSynchronizePasswordDialog } from '../ConfirmSynchronizePasswordDialog.js'
import { usePersonaRecovery } from '../../../contexts/index.js'
import { PrimaryButton } from '../../PrimaryButton/index.js'
import { RestoreContext } from './RestoreProvider.js'
import { RestoreStep } from './restoreReducer.js'
import { InputForm } from './InputForm.js'
import { ConfirmBackupInfo } from './ConfirmBackupInfo.js'
import { UserContext } from '../../../../shared-ui/index.js'
import { BackupPreview } from '../../BackupPreview/index.js'
import { PersonaContext } from '@masknet/shared'
import { Trans } from '@lingui/macro'

interface RestoreProps {
    onRestore: () => Promise<void>
}

const Restore = memo(function Restore({ onRestore }: RestoreProps) {
    const { fillSubmitOutlet } = usePersonaRecovery()
    const { state } = RestoreContext.useContainer()

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton size="large" color="primary" onClick={onRestore} loading={state.loading}>
                <Trans>Restore</Trans>
            </PrimaryButton>,
        )
    }, [onRestore, state.loading])

    if (!state.backupSummary) return null

    return <BackupPreview info={state.backupSummary} />
})

const RestoreFromCloudInner = memo(function RestoreFromCloudInner() {
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { user, updateUser } = UserContext.useContainer()
    const { currentPersona } = PersonaContext.useContainer()
    const { state, dispatch } = RestoreContext.useContainer()
    const { account, accountType, backupSummary, password, backupDecrypted } = state

    const [openSynchronizePasswordDialog, toggleSynchronizePasswordDialog] = useState(false)

    const changeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

    const restoreCallback = useCallback(async () => {
        if (!currentPersona) {
            const lastedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastedPersona) {
                await changeCurrentPersona(lastedPersona)
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
    }, [currentPersona, account, accountType, user, toggleSynchronizePasswordDialog, updateUser, changeCurrentPersona])

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

    return (
        <Box width="100%">
            {[RestoreStep.InputEmail, RestoreStep.InputPhone].includes(state.step) ?
                <InputForm />
            : state.step === RestoreStep.Decrypt ?
                <ConfirmBackupInfo />
            :   <Restore onRestore={handleRestore} />}
            {openSynchronizePasswordDialog ?
                <ConfirmSynchronizePasswordDialog
                    open={openSynchronizePasswordDialog}
                    onClose={() => onCloseSynchronizePassword()}
                    onConform={synchronizePassword}
                />
            :   null}
        </Box>
    )
})

export const RestoreFromCloud = memo(function RestoreFromCloud() {
    return (
        <RestoreContext>
            <RestoreFromCloudInner />
        </RestoreContext>
    )
})
