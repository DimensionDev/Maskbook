import React, { useState, useMemo, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Person } from '../../database'
import { Divider, IconButton } from '@material-ui/core'
import Services from '../service'
import { definedSocialNetworkUIs } from '../../social-network/ui'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'
import EditIcon from '@material-ui/icons/Edit'
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak'
import { useSnackbar } from 'notistack'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { useColorProvider } from '../../utils/theme'
import { geti18nString } from '../../utils/i18n'

import classNames from 'classnames'

interface Props {
    identity: Person
}

const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            width: 'auto',
            margin: theme.spacing(2),
        },
        focus: {
            margin: '-5px',
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
                flexShrink: 1,
                overflow: 'hidden',
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

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => (
    <RouterLink innerRef={ref} {...props} />
))

export default function PersonaCard({ identity }: Props) {
    const classes = useStyles()
    const color = useColorProvider()

    const [provePost, setProvePost] = useState<string>('')

    useMemo(() => {
        Services.Crypto.getMyProveBio(identity.identifier).then(p => setProvePost(p || ''))
    }, [identity.identifier])

    const friendlyName = useMemo(() => {
        const ui = [...definedSocialNetworkUIs].find(i => i.networkIdentifier === identity.identifier.network)
        return ui ? ui.friendlyName : `${geti18nString('dashboard_unknown_network')}(${identity.identifier.network})`
    }, [identity.identifier.network])

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
            Services.People.restoreBackup(restore)
            closeSnackbar(key)
        }
        return (key: string) => (
            <Button color="secondary" onClick={() => undo(key)}>
                {geti18nString('undo')}
            </Button>
        )
    }

    const deleteIdentity = async () => {
        const backup = await Services.Welcome.backupMyKeyPair(identity.identifier, {
            download: false,
            onlyBackupWhoAmI: true,
        })
        Services.People.removeMyIdentity(identity.identifier).then(() => {
            enqueueSnackbar(geti18nString('dashboard_item_deleted'), {
                variant: 'default',
                action: undoDeleteIdentity(backup),
            })
        })
    }

    const [rename, setRename] = useState(false)

    const renameIdentity = (event: React.FocusEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
        event.preventDefault()
        Services.People.updatePersonInfo(identity.identifier, { nickname: event.currentTarget.innerText }).then(() => {
            enqueueSnackbar(geti18nString('dashboard_item_done'), { variant: 'success', autoHideDuration: 1000 })
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
                                className={classNames('title', { fullWidth: rename })}
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
                                    <EditIcon fontSize="small" />
                                </Typography>
                            )}
                        </>
                    }
                    <RouterLink
                        component={IconButton}
                        className={classes.focus}
                        to={`/backup?identity=${identity.identifier.toText()}&qr`}>
                        <CenterFocusWeakIcon fontSize="small" />
                    </RouterLink>
                </Typography>
                <Typography className={classes.line} component="div">
                    <div className="title" title={friendlyName}>
                        {friendlyName}
                    </div>
                    <div className="content" title={identity.identifier.userId}>
                        {identity.identifier.userId}
                    </div>
                    <div className="extra-item" hidden>
                        {geti18nString('disconnect')}
                    </div>
                </Typography>
            </CardContent>
            <Divider />
            <CardContent>
                <Typography className={classes.line} component="div">
                    <div className="title">{geti18nString('public_key')}</div>
                    <div className="content" title={provePost}>
                        {provePost}
                    </div>
                    <div className={classNames('extra-item', color.info)} onClick={copyPublicKey}>
                        {geti18nString('copy')}
                    </div>
                </Typography>
            </CardContent>
            <Divider />
            <CardActions>
                <Button
                    size="small"
                    className={color.info}
                    color="primary"
                    component={Link}
                    to={`/backup?identity=${identity.identifier.toText()}`}>
                    {geti18nString('dashboard_create_backup')}
                </Button>
                <Button size="small" className={color.error} style={{ marginLeft: 'auto' }} onClick={deleteIdentity}>
                    {geti18nString('dashboard_delete_persona')}
                </Button>
            </CardActions>
        </Card>
    )
}
