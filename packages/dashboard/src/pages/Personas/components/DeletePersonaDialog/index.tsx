import {
    alpha,
    Button,
    DialogActions,
    DialogContent,
    InputBase,
    Link,
    Typography,
    inputBaseClasses,
} from '@material-ui/core'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { memo } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'

export interface DeletePersonaDialogProps {
    open: boolean
    onClose: () => void
    nickname?: string
}

const PasswordInput = styled(InputBase)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2.5),
    'label + &': {
        marginTop: theme.spacing(3),
    },
    [`& .${inputBaseClasses.input}`]: {
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

export const DeletePersonaDialog = memo(({ open, onClose, nickname }: DeletePersonaDialogProps) => {
    return (
        <MaskDialog open={open} title="Delete Persona" onClose={onClose}>
            <DialogContent>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    Please confirm that you have deleted persona <Link>{nickname}</Link> and entered your password.
                </Typography>
                <PasswordInput />
            </DialogContent>
            <DialogActions>
                <Button color="secondary">Cancel</Button>
                <Button>Confirm</Button>
            </DialogActions>
        </MaskDialog>
    )
})
