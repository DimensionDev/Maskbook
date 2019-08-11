import React, { useState } from 'react'
import { QrCode } from '../shared/qrcode'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { makeStyles, Typography } from '@material-ui/core'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { geti18nString } from '../../utils/i18n'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { ChooseIdentity } from '../shared/ChooseIdentity'

const useStyles = makeStyles({
    root: {
        textAlign: 'center',
        paddingTop: 24,
        '& > div': {
            margin: 'auto',
        },
    },
    code: {
        width: 404,
        height: 404,
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
        if (!current) return ''
        return Services.Welcome.backupMyKeyPair(current.identifier, false)
    }, [current]).then(x => setFile(JSON.stringify(x)))
    if (id.length === 0) {
        return (
            <main className={classes.root}>
                <NotSetupYetPrompt />
            </main>
        )
    }
    return (
        <main className={classes.root}>
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
