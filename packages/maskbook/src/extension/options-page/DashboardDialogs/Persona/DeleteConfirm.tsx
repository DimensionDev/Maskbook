import { Button } from '@material-ui/core'
import { UserMinus } from 'react-feather'
import { useSnackbarCallback } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'
import Services from '../../../service'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { PersonaProps } from './types'

export function DashboardPersonaDeleteConfirmDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const personas = useMyPersonas()
    const deletePersona = useSnackbarCallback(
        () => Services.Identity.deletePersona(persona.identifier, 'delete even with private'),
        [],
        () => (personas.length === 1 ? location.reload() : props.onClose()),
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#F4637D"
                primary={t('delete_persona')}
                secondary={t('dashboard_delete_persona_confirm_hint', { name: persona.nickname })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            color="danger"
                            onClick={deletePersona}
                            data-testid="confirm_button">
                            {t('confirm')}
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
