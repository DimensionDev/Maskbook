import { Attachment } from '@dimensiondev/common-protocols'
import { Checkbox, FormControlLabel, makeStyles, Typography } from '@material-ui/core'
import { isNil } from 'lodash-es'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useHistory } from 'react-router'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { makeFileKey } from '../arweave'
import { legalPolicy, legalTerms, MAX_FILE_SIZE, pluginId } from '../constants'
import type { FileInfo } from '../types'
import { toUint8Array } from '../utils'
import { RecentFiles } from './RecentFiles'
import { UploadDropArea } from './UploadDropArea'

const LEGAL_TERMS = (
    <a target="_blank" href={legalTerms}>
        terms
    </a>
)
const LEGAL_POLICY = (
    <a target="_blank" href={legalPolicy}>
        privacy policy
    </a>
)

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: 250,
    },
    upload: {
        flex: 1,
        display: 'flex',
    },
    legal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 'fit-content',
    },
    encrypted: {
        userSelect: 'none',
        '& span': {
            fontSize: 12,
            lineHeight: 1.75,
            color: '#3B3B3B',
        },
    },
    legalText: {
        userSelect: 'none',
        fontSize: 12,
        lineHeight: 1.75,
        color: '#3B3B3B',
        '& a': {
            color: '#2CA4EF',
            textDecoration: 'none',
        },
    },
})

export const Upload: React.FC = () => {
    const classes = useStyles()
    const history = useHistory()
    const snackbar = useSnackbar()
    const [encrypted, setEncrypted] = React.useState(true)
    const recents = useAsync(() => Services.Plugin.invokePlugin(pluginId, 'getRecentFiles'), [])
    const onFile = async (file: File) => {
        let key
        if (encrypted) {
            key = makeFileKey()
        }
        const block = await toUint8Array(file)
        const checksum = Buffer.from(await Attachment.checksum(block)).toString('base64')
        const item = await Services.Plugin.invokePlugin(pluginId, 'getFileInfo', checksum)
        if (isNil(item)) {
            history.push('/uploading', {
                key,
                name: file.name,
                size: file.size,
                type: file.type,
                block,
                checksum,
            })
        } else {
            history.push('/uploaded', item)
        }
    }
    const onMore = () => {
        // TODO: open new tab
        // show a selectable list
        // not started any designed
        snackbar.enqueueSnackbar('NOT SUPPORTED, Stage 2 feature')
    }
    return (
        <section className={classes.container}>
            <section className={classes.upload}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
                <RecentFiles files={recents.value ?? []} onMore={onMore} />
            </section>
            <section className={classes.legal}>
                <FormControlLabel
                    control={<Checkbox checked={encrypted} onChange={(event, checked) => setEncrypted(checked)} />}
                    className={classes.encrypted}
                    label="Make it encrypted"
                />
                <Typography className={classes.legalText}>
                    By using this plugin, you agree to the {LEGAL_TERMS} and the {LEGAL_POLICY}.
                </Typography>
            </section>
        </section>
    )
}
