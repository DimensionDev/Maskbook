import { memo } from 'react'
import { Button, createStyles, DialogActions, DialogContent, makeStyles, Typography } from '@material-ui/core'
import { AuthorIcon, EditIcon } from '@dimensiondev/icons'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import type { PersonaProvider } from '../../settings'
import { PersonaLine } from '../PersonaLine'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing(7, 7, 4, 7),
        },
        buttons: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(2,24%)',
            justifyContent: 'center',
            gridColumnGap: theme.spacing(2),
            marginTop: theme.spacing(5.5),
        },
        name: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(3),
        },
        content: {
            width: '100%',
            marginTop: theme.spacing(7),
        },
        author: {
            fontSize: 60,
            fill: MaskColorVar.secondaryBackground,
        },
        edit: {
            fontSize: theme.typography.subtitle1.fontSize,
            fill: 'none',
            marginLeft: theme.spacing(1.5),
            cursor: 'pointer',
        },
    }),
)

export interface EditPersonaDialogProps {
    open: boolean
    onClose: () => void
    providers: PersonaProvider[]
    nickname?: string
}

export const EditPersonaDialog = memo(({ open, onClose, nickname, providers }: EditPersonaDialogProps) => {
    const classes = useStyles()
    return (
        <MaskDialog open={open} title="Edit Persona" onClose={onClose}>
            <DialogContent className={classes.container}>
                <AuthorIcon className={classes.author} />
                <Typography variant="caption" classes={{ root: classes.name }}>
                    {nickname}
                    <EditIcon className={classes.edit} />
                </Typography>
                <div className={classes.content}>
                    {providers.map((provider) => {
                        return <PersonaLine key={provider.internalName} {...provider} />
                    })}
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="secondary">Cancel</Button>
                <Button>Confirm</Button>
            </DialogActions>
        </MaskDialog>
    )
})
