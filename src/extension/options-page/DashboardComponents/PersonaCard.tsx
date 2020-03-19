import React, { useState, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import type { Persona } from '../../../database'
import { Divider, TextField, Menu, MenuItem, Card } from '@material-ui/core'
import Services from '../../service'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useSnackbar } from 'notistack'
import { useColorProvider } from '../../../utils/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PersonaDeleteDialog, PersonaBackupDialog } from '../DashboardDialogs/Persona'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import ProfileBox from './ProfileBox'
import type { ProfileIdentifier } from '../../../database/type'

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
        },
        header: {
            display: 'flex',
            alignItems: 'center',
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

    const { enqueueSnackbar } = useSnackbar()

    const [rename, setRename] = useState(false)
    type Inputable = HTMLInputElement | HTMLTextAreaElement
    const renameIdentity = (event: React.FocusEvent<Inputable> | React.KeyboardEvent<Inputable>) => {
        event.preventDefault()
        Services.Identity.renamePersona(persona.identifier, event.currentTarget.value).then(() => {
            enqueueSnackbar(t('dashboard_item_done'), { variant: 'success', autoHideDuration: 1000 })
            setRename(false)
        })
    }

    const [deletePersona, setDeletePersona] = useState(false)
    const confirmDeletePersona = () => {
        enqueueSnackbar(t('dashboard_item_deleted'), {
            variant: 'default',
        })
    }

    const [backupPersona, setBackupPersona] = useState(false)

    const [anchorEl, setAnchorEl] = React.useState<null | Element>(null)
    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

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

    const dismissDialog = () => {
        setBackupPersona(false)
        setDeletePersona(false)
    }

    return (
        <Card className={classes.card} elevation={2}>
            <Typography className={classes.header} variant="h5" component="h2" gutterBottom>
                {!rename ? (
                    <>
                        <span title={persona.nickname} className={classes.title}>
                            {persona.nickname}
                        </span>
                        <MoreVertIcon className={classes.menu} fontSize="small" onClick={handleClick} />
                        <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClick={handleClose}
                            PaperProps={{ style: { minWidth: 100 } }}
                            onClose={handleClose}>
                            <MenuItem onClick={() => setRename(true)}>{t('rename')}</MenuItem>
                            <MenuItem onClick={() => setBackupPersona(true)}>{t('dashboard_create_backup')}</MenuItem>
                            <MenuItem onClick={() => setDeletePersona(true)} className={color.error}>
                                {t('dashboard_delete_persona')}
                            </MenuItem>
                        </Menu>
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
            {deletePersona && (
                <DialogRouter
                    onExit={dismissDialog}
                    children={
                        <PersonaDeleteDialog
                            onDecline={dismissDialog}
                            onConfirm={confirmDeletePersona}
                            persona={persona}
                        />
                    }
                />
            )}
            {backupPersona && (
                <DialogRouter
                    onExit={dismissDialog}
                    children={<PersonaBackupDialog onClose={dismissDialog} persona={persona} />}
                />
            )}
        </Card>
    )
}
