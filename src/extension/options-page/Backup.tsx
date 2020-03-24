import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    ButtonGroup,
    SnackbarContent,
    CircularProgress,
} from '@material-ui/core'

import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CenterFocusWeakIcon from '@material-ui/icons/CenterFocusWeak'

import Services from '../../extension/service'
import { makeStyles, Typography, createStyles } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'
import { ProfileIdentifier, Identifier } from '../../database/type'
import { QrCode } from '../../components/shared/qrcode'
import { amber } from '@material-ui/core/colors'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFormat/JSON/latest'
import { compressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'

const useStyles = makeStyles((theme) =>
    createStyles({
        code: {
            padding: '2em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            textAlign: 'center',
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
    const { t } = useI18N()
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
    const currentIdentifier = ProfileIdentifier.fromString(identity, ProfileIdentifier)

    useEffect(() => {
        if (currentIdentifier.err) return
        Services.Welcome.createBackupFile({ download: false, onlyBackupWhoAmI: true })
            .then((backupObj) => {
                setBackupObj(backupObj)
                setQRText(compressBackupFile(backupObj, currentIdentifier.val))
            })
            .catch((e) => {
                alert(e)
                setBackupObj(null)
                setQRText('')
            })
        // eslint will insert currentIdentifier to deps, which causes loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identity])

    const downloadAsFile = () => {
        Services.Welcome.downloadBackup(backupObj)
    }

    const friendlyIdentifier = currentIdentifier.ok ? (
        <>
            {currentIdentifier.val.userId}
            <wbr />@{currentIdentifier.val.network}
        </>
    ) : (
        'Unknown'
    )

    return (
        <Dialog open fullWidth onClose={handleClose}>
            <DialogTitle>{friendlyIdentifier}</DialogTitle>
            <DialogContent className={classes.container}>
                <ButtonGroup fullWidth>
                    <Button onClick={downloadAsFile} startIcon={<CloudDownloadIcon />}>
                        {t('dashboard_download')}
                    </Button>
                    <Button onClick={() => setShowQRCode(!showQRCode)} startIcon={<CenterFocusWeakIcon />}>
                        {t(showQRCode ? 'dashboard_hide_qr' : 'dashboard_show_qr')}
                    </Button>
                </ButtonGroup>
                {showQRCode ? (
                    <>
                        <div className={classes.code}>
                            {QRText ? (
                                <QrCode text={QRText} />
                            ) : (
                                <Typography variant="caption" style={{ margin: '5vh 0' }}>
                                    <CircularProgress />
                                    <br />
                                    {t('options_mobile_export_generating')}
                                </Typography>
                            )}
                        </div>
                        <SnackbarContent
                            classes={{ root: classes.warning }}
                            message={t('options_mobile_export_subtitle')}
                        />
                    </>
                ) : null}
                <div style={{ height: '5vh' }}></div>
            </DialogContent>
        </Dialog>
    )
}
