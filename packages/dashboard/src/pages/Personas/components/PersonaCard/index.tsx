import { memo, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { SettingsIcon } from '@dimensiondev/icons'
import { IconButton, MenuItem, Typography } from '@material-ui/core'
import { PersonaLine } from '../PersonaLine'
import { ECKeyIdentifier, useMenu } from '@dimensiondev/maskbook-shared'
//TODO: replace to new settings
import type { PersonaProvider } from '../../type'
import { EditPersonaDialog } from '../EditPersonaDialog'
import { DeletePersonaDialog } from '../DeletePersonaDialog'
import { useConnectSocialNetwork } from '../../hooks/useConnectSocialNetwork'
import { useDisConnectSocialNetwork } from '../../hooks/useDisConnectSocialNetwork'
import { useDashboardI18N } from '../../../../locales'

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
            backgroundColor: ({ active }: { active: boolean }) =>
                active ? MaskColorVar.greenMain : MaskColorVar.iconLight,
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
    nickname?: string
    active?: boolean
    identifier: ECKeyIdentifier
    providers: PersonaProvider[]
    onClick(): void
}

export const PersonaCard = memo<PersonaCardProps>(({ nickname, providers, active = false, onClick, identifier }) => {
    const t = useDashboardI18N()
    const classes = useStyles({ active })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [menu, openMenu] = useMenu(
        [
            <MenuItem onClick={() => setEditDialogOpen(true)}>{t.personas_edit()}</MenuItem>,
            <MenuItem onClick={() => setDeleteDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
                {t.personas_delete()}
            </MenuItem>,
        ],
        false,
        {},
        false,
    )

    const [, onConnect] = useConnectSocialNetwork()
    const [, onDisconnect] = useDisConnectSocialNetwork()

    return (
        <div className={classes.card} onClick={onClick}>
            <div className={classes.status} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography variant="subtitle2">{nickname}</Typography>
                    <IconButton onClick={openMenu} className={classes.setting}>
                        <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
                    </IconButton>
                </div>
                <div className={classes.content}>
                    {providers.map((provider) => {
                        return (
                            <PersonaLine
                                key={provider.internalName}
                                onConnect={() => onConnect(identifier.toText(), provider)}
                                onDisConnect={() => onDisconnect(provider?.identifier)}
                                {...provider}
                            />
                        )
                    })}
                </div>
            </div>
            {menu}
            <EditPersonaDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                nickname={nickname}
                providers={providers}
                identifier={identifier}
            />
            <DeletePersonaDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                nickname={nickname}
            />
        </div>
    )
})
