import React, { useState, useRef, useEffect } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Persona } from '../../../database'
import { Divider, TextField, Menu, MenuItem } from '@material-ui/core'
import Services from '../../service'
import SettingsIcon from '@material-ui/icons/Settings'
import { useSnackbar } from 'notistack'
import { useColorProvider } from '../../../utils/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { PersonaDeleteDialog, PersonaBackupDialog } from '../DashboardDialogs/Persona'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import ProfileBox from './ProfileBox'
import { ProfileIdentifier } from '../../../database/type'

interface Props {
    persona: Persona
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            width: '100%',
        },
        focus: {
            margin: '-5px',
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
                flexGrow: 1,
                overflow: 'hidden',
            },
            '& > .extra-item': {
                visibility: 'hidden',
                cursor: 'pointer',
                fontSize: '0.8rem',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
        cursor: {
            cursor: 'pointer',
        },
    }),
)

export default function PersonaCard({ persona }: Props) {
    const { t } = useI18N()
    const classes = useStyles()
    const color = useColorProvider()

    const [provePost, setProvePost] = useState<string>('')

    useEffect(() => {
        Services.Crypto.getMyProveBio(persona.identifier).then((p) => setProvePost(p || ''))
    }, [persona])

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const copyPublicKey = () => {
        navigator.clipboard
            .writeText(provePost)
            .then(() => enqueueSnackbar(t('dashboard_item_copied'), { variant: 'success', autoHideDuration: 1000 }))
            .catch((e) => {
                enqueueSnackbar(t('dashboard_item_copy_failed'), { variant: 'error' })
                setTimeout(() => prompt(t('automation_request_paste_into_bio_box'), provePost))
            })
    }

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

    const titleRef = useRef<HTMLSpanElement | null>(null)

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
        <>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2" gutterBottom>
                    {!rename ? (
                        <>
                            <span ref={titleRef} className="title">
                                {persona.nickname}
                            </span>
                            <Typography className="fullWidth" variant="body1" component="span" color="textSecondary">
                                <SettingsIcon className={classes.cursor} fontSize="small" onClick={handleClick} />
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClick={handleClose}
                                    PaperProps={{ style: { minWidth: 100 } }}
                                    onClose={handleClose}>
                                    <MenuItem onClick={() => setRename(true)}>{t('rename')}</MenuItem>
                                    {
                                        // <MenuItem onClick={copyPublicKey}>Copy Public Key</MenuItem>
                                    }
                                    <MenuItem onClick={() => setBackupPersona(true)}>
                                        {t('dashboard_create_backup')}
                                    </MenuItem>
                                    <MenuItem onClick={() => setDeletePersona(true)} className={color.error}>
                                        {t('dashboard_delete_persona')}
                                    </MenuItem>
                                </Menu>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <TextField
                                style={{ width: '100%', maxWidth: '320px' }}
                                inputProps={{ onKeyPress: (e) => e.key === 'Enter' && renameIdentity(e) }}
                                autoFocus
                                variant="outlined"
                                label="Name"
                                defaultValue={persona.nickname}
                                onBlur={(e) => renameIdentity(e)}></TextField>
                        </>
                    )}
                </Typography>
                <ProfileBox persona={persona} />
            </CardContent>
            <Divider />
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
        </>
    )
}
