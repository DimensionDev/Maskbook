import { Button, TextField } from '@material-ui/core'
import { useState } from 'react'
import { WALLET_OR_PERSONA_NAME_MAX_LEN, useI18N, checkInputLengthExceed } from '../../../../utils'
import Services from '../../../service'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { PersonaProps } from './types'

export function DashboardPersonaRenameDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const [name, setName] = useState(persona.nickname ?? '')
    const renamePersona = useSnackbarCallback(
        () => Services.Identity.renamePersona(persona.identifier, name),
        [persona.nickname],
        props.onClose,
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                primary={t('persona_rename')}
                content={
                    <TextField
                        helperText={
                            checkInputLengthExceed(name)
                                ? t('input_length_exceed_prompt', {
                                      name: t('persona_name').toLowerCase(),
                                      length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                  })
                                : undefined
                        }
                        required
                        label={t('persona_name')}
                        value={name}
                        autoFocus
                        onChange={(e) => setName(e.target.value)}
                        inputProps={{ onKeyPress: (e) => e.key === 'Enter' && renamePersona() }}
                    />
                }
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            onClick={renamePersona}
                            disabled={name.length === 0 || checkInputLengthExceed(name)}>
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
