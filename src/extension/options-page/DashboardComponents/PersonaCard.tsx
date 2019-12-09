import React, { useState, useMemo, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Persona } from '../../../database'
import { Divider, TextField, Menu, MenuItem } from '@material-ui/core'
import Services from '../../service'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'
import SettingsIcon from '@material-ui/icons/Settings'
import { useSnackbar } from 'notistack'
import { useColorProvider } from '../../../utils/theme'
import { geti18nString } from '../../../utils/i18n'
import classNames from 'classnames'
import ProviderLine from './ProviderLine'
import { BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { definedSocialNetworkWorkers } from '../../../social-network/worker'

interface Props {
    persona: Persona
}

const useStyles = makeStyles(theme =>
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
        line: {
            display: 'flex',
            alignItems: 'center',
            '&:not(:first-child)': {
                paddingTop: theme.spacing(1),
            },
            '& > div': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 1,
                whiteSpace: 'nowrap',
            },
            '& > .content': {
                margin: '0 1em',
            },
            '& > .title': {
                flexShrink: 0,
                width: '5rem',
            },
            '& > .extra-item': {
                visibility: 'hidden',
                marginRight: '0',
                flexShrink: 0,
                marginLeft: 'auto',
                cursor: 'pointer',
                fontSize: '0.8rem',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
    }),
)

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => (
    <RouterLink innerRef={ref} {...props} />
))

export default function PersonaCard({ persona }: Props) {
    const classes = useStyles()
    const color = useColorProvider()

    const [provePost, setProvePost] = useState<string>('')

    useMemo(() => {
        Services.Crypto.getMyProveBio(persona.identifier).then(p => setProvePost(p || ''))
    }, [persona.identifier])

    // FIXME:
    const profiles: any[] = [] || [...persona.linkedProfiles]

    const providers = [...definedSocialNetworkWorkers].map(i => {
        const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
        return {
            network: i.networkIdentifier,
            connected: !!profile,
            id: profile?.[0].userId,
        }
    })

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const copyPublicKey = () => {
        navigator.clipboard
            .writeText(provePost)
            .then(() =>
                enqueueSnackbar(geti18nString('dashboard_item_copied'), { variant: 'success', autoHideDuration: 1000 }),
            )
            .catch(e => {
                enqueueSnackbar(geti18nString('dashboard_item_copy_failed'), { variant: 'error' })
                setTimeout(() => prompt(geti18nString('automation_request_paste_into_bio_box'), provePost))
            })
    }

    const undoDeleteIdentity = (restore: BackupJSONFileLatest) => {
        const undo = (key: string) => {
            Services.Welcome.restoreBackup(restore)
            closeSnackbar(key)
        }
        return (key: string) => (
            <Button color="secondary" onClick={() => undo(key)}>
                {geti18nString('undo')}
            </Button>
        )
    }

    const deleteIdentity = async () => {
        const backup = await Services.Welcome.backupMyKeyPair({
            download: false,
            onlyBackupWhoAmI: true,
        })
        const ec_id = persona.identifier

        Services.Identity.deletePersona(ec_id, 'delete even with private').then(() => {
            enqueueSnackbar(geti18nString('dashboard_item_deleted'), {
                variant: 'default',
                action: undoDeleteIdentity(backup),
            })
        })
    }

    const [rename, setRename] = useState(false)

    const renameIdentity = (event: React.FocusEvent<HTMLInputElement>) => {
        event.preventDefault()
        // Services.Identity.updateProfileInfo(persona.identifier, { nickname: event.currentTarget.innerText }).then(
        //     () => {
        //         enqueueSnackbar(geti18nString('dashboard_item_done'), { variant: 'success', autoHideDuration: 1000 })
        //         setRename(false)
        //     },
        // )
    }

    const titleRef = useRef<HTMLSpanElement | null>(null)

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const handleClick = (event: React.MouseEvent<any>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
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
                                <SettingsIcon fontSize="small" onClick={handleClick} />
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClick={handleClose}
                                    onClose={handleClose}>
                                    <MenuItem onClick={() => setRename(true)}>Rename</MenuItem>
                                    <MenuItem onClick={copyPublicKey}>Copy Public Key</MenuItem>
                                    <MenuItem onClick={handleClose}>
                                        {geti18nString('dashboard_create_backup')}
                                    </MenuItem>
                                    <MenuItem onClick={handleClose} className={color.error}>
                                        {geti18nString('dashboard_delete_persona')}
                                    </MenuItem>
                                </Menu>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <TextField
                                style={{ width: '100%', maxWidth: '320px' }}
                                autoFocus
                                variant="outlined"
                                label="Name"
                                defaultValue={persona.nickname}
                                onBlur={renameIdentity}></TextField>
                        </>
                    )}
                </Typography>
                {providers.map(provider => (
                    <Typography className={classes.line} component="div">
                        <ProviderLine {...provider}></ProviderLine>
                        {provider.connected && (
                            <div className={classNames('extra-item', color.error)}>{geti18nString('disconnect')}</div>
                        )}
                    </Typography>
                ))}
            </CardContent>
            <Divider />
        </>
    )
}
