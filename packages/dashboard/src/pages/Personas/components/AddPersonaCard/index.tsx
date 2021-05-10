import { memo, useState } from 'react'
import { createStyles, makeStyles, Button, TextField } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { checkInputLengthExceed } from '../../../../utils'
import { PERSONA_NAME_MAX_LENGTH } from '../../../../constants'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

export interface AddPersonaCardProps {
    onConfirm: (name?: string) => void
    onCancel: () => void
}

export const AddPersonaCard = memo(({ onConfirm, onCancel }: AddPersonaCardProps) => {
    const t = useDashboardI18N()
    const [name, setName] = useState('')
    const classes = useStyles()

    return (
        <div className={classes.container}>
            {/*TODO: add color prop */}
            <TextField
                variant="filled"
                error={checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)}
                helperText={
                    checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)
                        ? t.personas_name_maximum_tips({ length: String(PERSONA_NAME_MAX_LENGTH) })
                        : ''
                }
                InputProps={{ disableUnderline: true }}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className={classes.buttons}>
                <Button
                    disabled={!name.length || checkInputLengthExceed(name, PERSONA_NAME_MAX_LENGTH)}
                    onClick={() => onConfirm(name)}>
                    {t.personas_confirm()}
                </Button>
                <Button color="secondary" onClick={onCancel}>
                    {t.personas_cancel()}
                </Button>
            </div>
        </div>
    )
})
