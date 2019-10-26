import React, { useState, useMemo, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Person } from '../../database'
import { Divider } from '@material-ui/core'
import Services from '../service'
import { definedSocialNetworkUIs } from '../../social-network/ui'
import { Link } from 'react-router-dom'
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak'
import { useSnackbar } from 'notistack'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { useColorProvider } from '../../utils/theme'

interface Props {
    identity: Person
}

const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            minWidth: 375,
            margin: 20,
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
            },
            '& > .fullWidth': {
                flexGrow: 1,
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

export default function PersonaCard({ identity }: Props) {
    const classes = useStyles()
    const color = useColorProvider()

    const [provePost, setProvePost] = useState<string>('')

    useMemo(() => {
        Services.Crypto.getMyProveBio(identity.identifier).then(p => setProvePost(p || ''))
    }, [identity.identifier])

    const [friendlyName, setFriendlyName] = useState<string>('')

    useMemo(() => {
        const ui = [...definedSocialNetworkUIs].find(i => i.networkIdentifier === identity.identifier.network)
        setFriendlyName(ui ? ui.friendlyName : `Unknown(${identity.identifier.network})`)
    }, [identity.identifier.network])

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const copyPublicKey = () => {
        navigator.clipboard
            .writeText(provePost)
            .then(() => {
                enqueueSnackbar('Copied.', { variant: 'success', autoHideDuration: 1000 })
            })
            .catch(e => {
                enqueueSnackbar('Copy Failed.' + provePost, { variant: 'error' })
            })
    }

    const undoDeleteIdentity = (restore: BackupJSONFileLatest) => {
        const undo = (key: any) => {
            Services.People.restoreBackup(restore)
            closeSnackbar(key)
        }
        return (key: any) => (
            <Button color="secondary" onClick={() => undo(key)}>
                Undo
            </Button>
        )
    }

    const deleteIdentity = async () => {
        const backup = await Services.Welcome.backupMyKeyPair(identity.identifier, {
            download: false,
            onlyBackupWhoAmI: true,
        })
        Services.People.removeMyIdentity(identity.identifier).then(() => {
            enqueueSnackbar('Deleted.', { variant: 'default', action: undoDeleteIdentity(backup) })
        })
    }

    const [rename, setRename] = useState(false)

    const renameIdentity = (event: React.FocusEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
        event.preventDefault()
        // @ts-ignore
        Services.People.updatePersonInfo(identity.identifier, { nickname: event.target.innerText }).then(() => {
            enqueueSnackbar('Done.', { variant: 'success', autoHideDuration: 1000 })
            setRename(false)
        })
    }

    const titleRef = useRef<HTMLSpanElement | null>(null)

    return (
        <Card className={classes.card} raised elevation={3}>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2" gutterBottom>
                    {
                        <>
                            <span
                                suppressContentEditableWarning
                                ref={titleRef}
                                className={`title ${rename ? 'fullWidth' : ''}`}
                                onKeyPress={e => e.key === 'Enter' && renameIdentity(e)}
                                {...(rename ? { onBlur: renameIdentity, contentEditable: true } : {})}>
                                {identity.nickname || identity.identifier.userId}
                            </span>
                            {!rename && (
                                <Typography
                                    className="extra-item fullWidth"
                                    variant="body1"
                                    component="span"
                                    color="textSecondary"
                                    onClick={() => {
                                        setRename(true)
                                        setTimeout(() => titleRef.current && titleRef.current!.focus())
                                    }}>
                                    [Edit Name]
                                </Typography>
                            )}
                        </>
                    }
                    <Link component={Button} to={`/backup?identity=${identity.identifier.toText()}&qr`}>
                        <CenterFocusWeakIcon fontSize="small" />
                    </Link>
                </Typography>
                <Typography className={classes.line} component="div">
                    <div className="title" title={friendlyName}>
                        {friendlyName}
                    </div>
                    <div className="content" title={identity.identifier.userId}>
                        {identity.identifier.userId}
                    </div>
                    <div className="extra-item" hidden>
                        Disconnect
                    </div>
                </Typography>
            </CardContent>
            <Divider />
            <CardContent>
                <Typography className={classes.line} component="div">
                    <div className="title">Public Key</div>
                    <div className="content" title={provePost}>
                        {provePost}
                    </div>
                    <div className={`extra-item ${color.info}`} onClick={copyPublicKey}>
                        Copy
                    </div>
                </Typography>
            </CardContent>
            <Divider />
            <CardActions>
                {
                    // @ts-ignore
                    <Link
                        size="small"
                        className={color.info}
                        to={`/backup?identity=${identity.identifier.toText()}`}
                        component={Button}>
                        Create Backup
                    </Link>
                }
                <Button size="small" className={color.error} style={{ marginLeft: 'auto' }} onClick={deleteIdentity}>
                    Delete Persona
                </Button>
            </CardActions>
        </Card>
    )
}
