import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Dialog, DialogTitle, DialogContent, Button, ButtonGroup, SnackbarContent } from '@material-ui/core'

import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak'

import Services from '../../extension/service'
import { makeStyles, Typography, createStyles } from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
import { compressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier } from '../../database/type'
import { QrCode } from '../../components/shared/qrcode'
import { amber } from '@material-ui/core/colors'

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            textAlign: 'center',
            paddingTop: 24,
            maxWidth: 600,
            margin: 'auto',
            '& > div': {
                margin: 'auto',
            },
        },
        code: {
            padding: '2em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            textAlign: 'center',
        },
        avatar: {
            height: '3.5rem',
            width: '3.5rem',
            marginRight: theme.spacing(1),
            ...(theme.palette.type === 'dark'
                ? {}
                : { backgroundColor: 'rgb(238,238,238)', color: 'rgb(118,118,118)' }),
        },
        warning: {
            backgroundColor: amber[600],
            color: theme.palette.getContrastText(amber[600]),
            '& > div': {
                margin: 'auto',
            },
        },
    }),
)

export default function BackupDialog() {
    const history = useHistory()

    const handleClose = () => {
        history.replace('/')
    }

    const search = new URLSearchParams(history.location.search)

    const classes = useStyles()
    const [backupObj, setBackupObj] = useState<BackupJSONFileLatest | null>(null)
    const [QRText, setQRText] = useState('')
    const [showQRCode, setShowQRCode] = useState(search.get('qr') === null ? false : true)

    const identity = search.get('identity') || ''
    const currentIdentifier = PersonIdentifier.fromString(identity) as PersonIdentifier

    useEffect(() => {
        if (!currentIdentifier) return
        Services.Welcome.backupMyKeyPair(currentIdentifier, { download: false, onlyBackupWhoAmI: true })
            .then(backupObj => {
                setBackupObj(backupObj)
                setQRText(compressBackupFile(backupObj))
            })
            .catch(e => {
                alert(e)
                setBackupObj(null)
                setQRText('')
            })
    }, [currentIdentifier, identity])

    const downloadAsFile = () => {
        Services.Welcome.downloadBackup(backupObj)
    }

    return (
        <Dialog open fullWidth onClose={handleClose}>
            <DialogTitle>{currentIdentifier ? currentIdentifier.friendlyToText() : 'Unknown'}</DialogTitle>
            <DialogContent className={classes.container}>
                <ButtonGroup fullWidth>
                    <Button onClick={downloadAsFile} startIcon={<CloudDownloadIcon />}>
                        {geti18nString('dashboard_download')}
                    </Button>
                    <Button onClick={() => setShowQRCode(!showQRCode)} startIcon={<CenterFocusWeakIcon />}>
                        {geti18nString(showQRCode ? 'dashboard_hide_qr' : 'dashboard_show_qr')}
                    </Button>
                </ButtonGroup>
                {showQRCode ? (
                    <>
                        <div className={classes.code}>
                            {QRText ? (
                                <QrCode text={QRText} />
                            ) : (
                                <Typography variant="caption" style={{ margin: '5vh 0' }}>
                                    {geti18nString('options_mobile_export_generating')}
                                </Typography>
                            )}
                        </div>
                        <SnackbarContent
                            classes={{ root: classes.warning }}
                            message={geti18nString('options_mobile_export_subtitle')}
                        />
                    </>
                ) : null}
                <div style={{ height: '5vh' }}></div>
            </DialogContent>
        </Dialog>
    )
}
