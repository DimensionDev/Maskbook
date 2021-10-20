import { Button } from '@mui/material'
import { UserMinus } from 'react-feather'
import { useSnackbarCallback } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import Services from '../../../service'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { ContactProps } from './types'

export function DashboardContactDeleteConfirmDialog(
    props: WrappedDialogProps<ContactProps & { onDeleted: () => void }>,
) {
    const { contact, onDeleted } = props.ComponentProps!
    const { t } = useI18N()

    // TODO!: delete profile breaks database
    const onDelete = useSnackbarCallback(
        // ! directly destroy parent dialog is NG so close self first
        () => Services.Identity.removeProfile(contact.identifier).then(props.onClose),
        [contact],
        () => {
            props.onClose()
            setTimeout(() => onDeleted(), 0)
        },
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#F4637D"
                primary={t('delete_contact')}
                secondary={t('delete_contact_confirmation', { contact: contact.nickname ?? contact.identifier.userId })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onDelete}>
                            {t('ok')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
