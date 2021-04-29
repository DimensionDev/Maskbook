import { memo } from 'react'
import { createStyles, makeStyles, Typography } from '@material-ui/core'
import { AuthorIcon, EditIcon } from '@dimensiondev/icons'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import type { PersonaProvider } from '../../settings'
import type { Persona } from '../../../../../../maskbook/src/database'
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
        name: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(3),
        },
        content: {
            width: '100%',
            marginTop: theme.spacing(7),
        },
    }),
)

export interface EditPersonaDialogProps {
    open: boolean
    onClose: () => void
    persona: Persona
    providers: PersonaProvider[]
}

export const EditPersonaDialog = memo(({ open, onClose, persona, providers }: EditPersonaDialogProps) => {
    const classes = useStyles()
    return (
        <MaskDialog open={open} title="Edit Persona" onClose={onClose}>
            <div className={classes.container}>
                <AuthorIcon sx={{ fontSize: 60, fill: MaskColorVar.secondaryBackground }} />

                <Typography variant="caption" classes={{ root: classes.name }} sx={{ marginTop: 3 }}>
                    {persona.nickname}
                    <EditIcon sx={{ fontSize: 16, fill: 'none', marginLeft: 1.5 }} />
                </Typography>
                <div className={classes.content}>
                    {providers.map((provider) => {
                        return <PersonaLine key={provider.internalName} provider={provider} />
                    })}
                </div>
            </div>
        </MaskDialog>
    )
})
