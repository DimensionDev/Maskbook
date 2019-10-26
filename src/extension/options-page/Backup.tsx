import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core'

import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak'

import Services from '../../extension/service'
import { makeStyles, Typography } from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
import { compressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'
import { PersonIdentifier } from '../../database/type'
import { QrCode } from '../../components/shared/qrcode'

const useStyles = makeStyles({
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
        display: 'flex',
        justifyContent: 'space-evenly',
        textAlign: 'center',
    },
    rounded: {
        display: 'inline-flex',
        height: '3.5rem',
        width: '3.5rem',
        margin: 10,
        borderRadius: '50%',
        backgroundColor: 'rgb(238,238,238)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

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
            <DialogContent>
                <div className={classes.container}>
                    <div onClick={downloadAsFile}>
                        <a color="textPrimary">
                            <span className={classes.rounded}>
                                <CloudDownloadIcon fontSize="large" />
                            </span>
                        </a>
                        <div>Download as File</div>
                    </div>
                    <div onClick={() => setShowQRCode(!showQRCode)}>
                        <a color="textPrimary">
                            <span className={classes.rounded}>
                                <CenterFocusWeakIcon fontSize="large" />
                            </span>
                        </a>
                        <div>{`${showQRCode ? 'Hide' : 'Show'} QR Code`}</div>
                    </div>
                </div>
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
                        <Typography color="error" variant="h6" style={{ textAlign: 'center' }}>
                            {geti18nString('options_mobile_export_subtitle')}
                        </Typography>
                    </>
                ) : (
                    <div style={{ height: '5vh' }}></div>
                )}
            </DialogContent>
        </Dialog>
    )
}
