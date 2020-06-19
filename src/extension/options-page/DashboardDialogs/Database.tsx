import React from 'react'
import { DialogContentItem } from './DialogBase'

import ActionButton from '../DashboardComponents/ActionButton'
import { useI18N } from '../../../utils/i18n-next-ui'

interface DatabaseRestoreSuccessDialogProps {
    permissions?: boolean | null
    onConfirm(): void
    onDecline?(): void
}

export function DatabaseRestoreSuccessDialog({ permissions, onConfirm, onDecline }: DatabaseRestoreSuccessDialogProps) {
    const { t } = useI18N()
    return (
        <DialogContentItem
            simplified
            title={t(permissions ? 'dashboard_ready_to_import' : 'import_successful')}
            content={t(permissions ? 'dashboard_ready_to_import_hint' : 'dashboard_database_import_successful_hint')}
            actions={
                <>
                    {permissions ? (
                        <>
                            <ActionButton
                                style={{ marginLeft: 0, marginRight: 'auto' }}
                                variant="outlined"
                                color="default"
                                onClick={onDecline}>
                                {t('cancel')}
                            </ActionButton>
                            <ActionButton variant="contained" color={'primary'} onClick={onConfirm}>
                                {t('proceed')}
                            </ActionButton>
                        </>
                    ) : (
                        <ActionButton variant="outlined" color={'default'} onClick={onConfirm}>
                            {t('ok')}
                        </ActionButton>
                    )}
                </>
            }></DialogContentItem>
    )
}

interface DatabaseRestoreFailedDialogProps {
    error: Error | string | null
    onConfirm(): void
}

export function DatabaseRestoreFailedDialog({ error, onConfirm }: DatabaseRestoreFailedDialogProps) {
    const { t } = useI18N()
    return (
        <DialogContentItem
            simplified
            title={t('import_failed')}
            content={typeof error === 'string' ? error : error?.message ?? 'Unknown Error'}
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {t('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
