import { Button } from '@material-ui/core'
import type { FC } from 'react'
import { Trash2 as TrashIcon } from 'react-feather'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../../DashboardDialogs/Base'

export interface HideDialogProps {
    onConfirm?: () => void
}

export const HideDialog: FC<WrappedDialogProps<HideDialogProps>> = ({ ComponentProps, open, onClose }) => {
    const { t } = useI18N()
    return (
        <DashboardDialogCore fullScreen={false} open={open} onClose={onClose}>
            <DashboardDialogWrapper
                size="small"
                icon={<TrashIcon />}
                iconColor="#F4637D"
                primary={t('hide_token')}
                secondary={t('hide_token_hint', { token: name })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            color="danger"
                            onClick={() => ComponentProps?.onConfirm?.()}>
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
