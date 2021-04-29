import { alpha, Button, InputBase, Link, makeStyles, Typography } from '@material-ui/core'
import { createStyles, experimentalStyled as styled } from '@material-ui/core/styles'
import type { Persona } from '../../../../../../maskbook/src/database'
import { memo } from 'react'
import { MaskColorVar, MaskDialog } from '../../../../../../theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(6, 4.5, 4, 4.5),
        },
        buttons: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(2,22%)',
            justifyContent: 'center',
            gridColumnGap: theme.spacing(2),
            marginTop: theme.spacing(6),
        },
    }),
)

export interface DeletePersonaDialogProps {
    open: boolean
    onClose: () => void
    persona: Persona
}

const PasswordInput = styled(InputBase)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2.5),
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        width: '100%',
        borderRadius: 4,
        position: 'relative',
        backgroundColor: MaskColorVar.normalBackground,
        border: `1px solid ${MaskColorVar.border}`,
        fontSize: theme.typography.subtitle1.fontSize,
        padding: theme.spacing(1.2, 1.5),
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        '&:focus': {
            boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
            borderColor: theme.palette.primary.main,
        },
    },
}))

export const DeletePersonaDialog = memo(({ open, onClose, persona }: DeletePersonaDialogProps) => {
    const classes = useStyles()
    return (
        <MaskDialog open={open} title="Delete Persona" onClose={onClose}>
            <div className={classes.container}>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    Please confirm that you have deleted persona <Link>{persona.nickname}</Link> and entered your
                    password.
                </Typography>
                <PasswordInput />
                <div className={classes.buttons}>
                    <Button color="secondary">Cancel</Button>
                    <Button>Confirm</Button>
                </div>
            </div>
        </MaskDialog>
    )
})
