import { Checkbox, FormControlLabel, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import { useHistory } from 'react-router'
import { makeFileKey } from '../arweave'
import { legalPolicy, legalTerms, MAX_FILE_SIZE } from '../constants'
import { toUint8Array } from '../utils'
import { RecentFiles } from './RecentFiles'
import { UploadDropArea } from './UploadDropArea'
import { Attachment } from '@dimensiondev/common-protocols'
import type { FileInfo } from '../hooks/Exchange'
import { useSnackbar } from 'notistack'

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
    // TODO: query recent uploaded files (the first 4 records)
    const files: FileInfo[] = []
    const onFile = async (file: File) => {
        let key
        if (encrypted) {
            key = makeFileKey()
        }
        const block = await toUint8Array(file)
        const checksum = await Attachment.checksum(block)
        // TODO: check upload history
        // if [ same checksum exists ]; then
        //    goto uploaded page
        // else
        //    goto uploading page
        // fi
        history.push('/uploading', {
            key,
            name: file.name,
            size: file.size,
            type: file.type,
            block,
            checksum,
        })
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
                <RecentFiles files={files} onMore={onMore} />
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
