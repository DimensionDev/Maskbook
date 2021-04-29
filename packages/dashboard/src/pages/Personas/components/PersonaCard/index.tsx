import { memo, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { SettingsIcon } from '@dimensiondev/icons'
import { IconButton, MenuItem, Typography } from '@material-ui/core'
import { useMenu } from '../../../../../../maskbook/src/utils/hooks/useMenu'
import { PersonaLine } from '../PersonaLine'
import type { Persona } from '../../../../../../maskbook/src/database'
import type { PersonaProvider } from '../../settings'
import { EditPersonaDialog } from '../EditPersonaDialog'
import { DeletePersonaDialog } from '../DeletePersonaDialog'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: Number(theme.shape.borderRadius) * 3,
            backgroundColor: MaskColorVar.primaryBackground,
            display: 'flex',
            padding: theme.spacing(1.25),
            minWidth: 320,
        },
        status: {
            width: 10,
            height: 10,
            borderRadius: '50%',
            marginRight: theme.spacing(1.25),
            marginTop: theme.spacing(0.625),
            color: (active) => (active ? MaskColorVar.greenMain : MaskColorVar.iconLight),
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: theme.typography.caption.fontSize,
        },
        content: {
            marginTop: theme.spacing(1.25),
            paddingRight: theme.spacing(1.25),
        },
        line: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: theme.typography.caption.fontSize,
        },
        setting: {
            fontSize: theme.typography.caption.fontSize,
            padding: 0,
        },
    }),
)

export interface PersonaCardProps {
    persona: Persona
    active?: boolean
    providers: PersonaProvider[]
    onClick(): void
}

export const PersonaCard = memo(({ persona, providers, active = false, onClick }: PersonaCardProps) => {
    const classes = useStyles({ active })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [menu, openMenu] = useMenu(
        [
            <MenuItem onClick={() => setEditDialogOpen(true)}>Edit</MenuItem>,
            <MenuItem onClick={() => setDeleteDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
                Delete
            </MenuItem>,
        ],
        false,
        {},
        false,
    )

    return (
        <div className={classes.card} onClick={onClick}>
            <div className={classes.status} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography variant="subtitle2">{persona.nickname}</Typography>
                    <IconButton onClick={openMenu} className={classes.setting}>
                        <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
                    </IconButton>
                </div>
                <div className={classes.content}>
                    {providers.map((provider) => {
                        return <PersonaLine key={provider.internalName} provider={provider} />
                    })}
                </div>
            </div>
            {menu}
            <EditPersonaDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                persona={persona}
                providers={providers}
            />
            <DeletePersonaDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} persona={persona} />
        </div>
    )
})
