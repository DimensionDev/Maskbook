import { memo, useState } from 'react'
import { Button, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { isPersonaNameLengthValid, PERSONA_NAME_MAX_LENGTH } from '../../../../utils/checkLengthExceed'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        borderRadius: Number(theme.shape.borderRadius) * 2,
        padding: theme.spacing(1.5),
        gridRowGap: theme.spacing(1.25),
        backgroundColor: MaskColorVar.primaryBackground,
    },
    buttons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gridColumnGap: theme.spacing(3),
    },
}))

export interface AddPersonaCardProps {
    onConfirm: (name: string) => void
    onCancel: () => void
}

export const AddPersonaCard = memo<AddPersonaCardProps>(({ onConfirm, onCancel }) => {
    const t = useDashboardI18N()
    const [name, setName] = useState('')
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            {/* TODO: add color prop */}
            <TextField
                label="Name"
                variant="filled"
                error={!isPersonaNameLengthValid(name)}
                helperText={
                    !isPersonaNameLengthValid(name)
                        ? t.personas_name_maximum_tips({ length: String(PERSONA_NAME_MAX_LENGTH) })
                        : ''
                }
                InputProps={{ disableUnderline: true }}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className={classes.buttons}>
                <Button disabled={!name.length || !isPersonaNameLengthValid(name)} onClick={() => onConfirm(name)}>
                    {t.personas_confirm()}
                </Button>
                <Button color="secondary" onClick={onCancel}>
                    {t.personas_cancel()}
                </Button>
            </div>
        </div>
    )
})
