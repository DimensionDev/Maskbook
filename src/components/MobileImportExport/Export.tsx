import React, { useState } from 'react'
import { QrCode } from '../shared/qrcode'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { makeStyles, Typography, Button, Link } from '@material-ui/core'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { geti18nString } from '../../utils/i18n'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { ChooseIdentity } from '../shared/ChooseIdentity'
import { compressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'
import { BackupJSONFileLatest } from '../../utils/type-transform/BackupFile'

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
})
export function ExportData() {
    const classes = useStyles()
    const [file, setFile] = useState('')

    const id = useMyIdentities()
    const current = useCurrentIdentity()

    useAsync(async () => {
        if (!current) return {} as BackupJSONFileLatest
        return Services.Welcome.backupMyKeyPair(current.identifier, { download: false, onlyBackupWhoAmI: true })
    }, [current]).then(x => {
        try {
            setFile(compressBackupFile(x))
        } catch {
            setFile('')
        }
    })
    if (id.length === 0) {
        return (
            <main className={classes.root}>
                <NotSetupYetPrompt />
            </main>
        )
    }
    return (
        <main className={classes.root}>
            <Typography style={{ marginBottom: 24 }}>
                <Button style={{ marginRight: 12 }} size="small" variant="outlined" color="primary" disabled>
                    Beta
                </Button>
                {'Checkout Maskbook '}
                <Link target="_blank" href="https://testflight.apple.com/join/OGmGmIg1">
                    iOS
                </Link>
                {' and '}
                <Link target="_blank" href="https://play.google.com/store/apps/details?id=com.dimension.maskbook">
                    Android
                </Link>
                {' version'}
            </Typography>
            <Typography style={{ marginBottom: 24 }}>
                {'Maskbook is also available on '}
                <Link target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/maskbook/">
                    Firefox and Firefox for Android
                </Link>
            </Typography>
            {id.length > 1 ? <ChooseIdentity /> : null}
            <div className={classes.code}>
                {file ? (
                    <QrCode text={file} />
                ) : (
                    <Typography variant="caption">{geti18nString('options_mobile_export_generating')}</Typography>
                )}
            </div>
            <br />
            <br />
            <Typography variant="h4">{geti18nString('options_mobile_export_title')}</Typography>
            <br />
            <Typography color="error" variant="h5">
                {geti18nString('options_mobile_export_subtitle')}
            </Typography>
        </main>
    )
}
