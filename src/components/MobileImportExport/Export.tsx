import React, { useState } from 'react'
import { QrCode } from './qrcode'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { makeStyles, Typography } from '@material-ui/core'
import { NotSetupYetPrompt } from '../InjectedComponents/NotSetupYetPrompt'
import { geti18nString } from '../../utils/i18n'

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
export function ExportData(props: {}) {
    const classes = useStyles()
    const [file, setFile] = useState('')
    const [hasId, setHasId] = useState(false)
    useAsync(async () => {
        const id = await Services.People.queryMyIdentity()
        if (id.length !== 0) setHasId(true)
        return Services.Welcome.backupMyKeyPair(id[0].identifier, false)
    }, []).then(x => setFile(JSON.stringify(x)))
    if (!hasId) {
        return (
            <main className={classes.root}>
                <NotSetupYetPrompt />
            </main>
        )
    }
    return (
        <main className={classes.root}>
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
