import React, { useState, useMemo } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import type { Persona } from '../../../database'
import { TextField, MenuItem, Card, IconButton } from '@material-ui/core'
import Services from '../../service'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useColorProvider } from '../../../utils/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import ProfileBox from './ProfileBox'
import type { ProfileIdentifier } from '../../../database/type'
import { useModal, useSnackbarCallback } from '../Dialog/Base'
import { DashboardPersonaBackupDialog, DashboardPersonaDeleteConfirmDialog } from '../Dialog/Persona'
import DashboardMenu from './DashboardMenu'

interface Props {
    persona: Persona
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            width: '350px',
            flex: '0 0 auto',
            marginRight: theme.spacing(6),
            marginBottom: theme.spacing(5),
            padding: theme.spacing(4, 3, 5, 3),
            boxShadow:
                theme.palette.type === 'dark'
                    ? 'none'
                    : '0px 2px 4px rgba(96, 97, 112, 0.16), 0px 0px 1px rgba(40, 41, 61, 0.04)',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing(3),
        },
        title: {
            flex: '1 1 auto',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all',
            whiteSpace: 'nowrap',
            fontWeight: 500,
        },
        menu: {
            flex: '0 0 auto',
            marginLeft: theme.spacing(1),
            cursor: 'pointer',
        },
    }),
)

export default function PersonaCard({ persona }: Props) {
    const { t } = useI18N()
    const classes = useStyles()
    const color = useColorProvider()

    const [rename, setRename] = useState(false)
    type Inputable = HTMLInputElement | HTMLTextAreaElement
    const renameIdentity = useSnackbarCallback(
        (event: React.FocusEvent<Inputable> | React.KeyboardEvent<Inputable>) => {
            event.preventDefault()
            return Services.Identity.renamePersona(persona.identifier, event.currentTarget.value)
        },
        [rename],
        () => setRename(false),
    )

    const [deletePersona, openDeletePersona] = useModal(DashboardPersonaDeleteConfirmDialog, { persona })
    const [backupPersona, openBackupPersona] = useModal(DashboardPersonaBackupDialog, { persona })

    const menus = useMemo(
        () => [
            <MenuItem onClick={() => setRename(true)}>{t('rename')}</MenuItem>,
            <MenuItem onClick={openBackupPersona}>{t('backup')}</MenuItem>,
            <MenuItem onClick={openDeletePersona} className={color.error}>
                {t('delete')}
            </MenuItem>,
        ],
        [t, openBackupPersona, openDeletePersona, color.error],
    )

    const [menu, , openMenu] = useModal(DashboardMenu, { menus })

    const id = persona.linkedProfiles.keys().next().value as ProfileIdentifier | undefined
    React.useEffect(() => {
        if (persona.nickname) return
        const profile = id
        if (!profile) Services.Identity.renamePersona(persona.identifier, persona.identifier.compressedPoint)
        else
            Services.Identity.queryProfile(profile)
                .then((profile) => profile.nickname || profile.identifier.userId)
                .then((newName) => Services.Identity.renamePersona(persona.identifier, newName))
    }, [persona.identifier, id, persona.nickname])

    return (
        <Card className={classes.card} elevation={2}>
            <Typography className={classes.header} variant="h5" component="h2">
                {!rename ? (
                    <>
                        <span title={persona.nickname} className={classes.title}>
                            {persona.nickname}
                        </span>
                        <IconButton
                            size="small"
                            className={classes.menu}
                            onClick={(e) => openMenu({ anchorEl: e.currentTarget })}>
                            <MoreVertIcon />
                        </IconButton>
                        {menu}
                    </>
                ) : (
                    <TextField
                        style={{ width: '100%', maxWidth: '320px' }}
                        inputProps={{ onKeyPress: (e) => e.key === 'Enter' && renameIdentity(e) }}
                        autoFocus
                        variant="outlined"
                        label="Name"
                        defaultValue={persona.nickname}
                        onBlur={(e) => renameIdentity(e)}></TextField>
                )}
            </Typography>
            <ProfileBox persona={persona} />
            {deletePersona}
            {backupPersona}
        </Card>
    )
}
