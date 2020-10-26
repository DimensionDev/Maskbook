import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import { Checkbox, FormControlLabel, makeStyles, Typography, Link } from '@material-ui/core'
import { isNil } from 'lodash-es'
import React from 'react'
import { Trans } from 'react-i18next'
import { useHistory } from 'react-router'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeFileKey } from '../arweave/makeFileKey'
import { FileRouter, MAX_FILE_SIZE, pluginId } from '../constants'
import { RecentFiles } from './RecentFiles'
import { UploadDropArea } from './UploadDropArea'

const useStyles = makeStyles((theme) => ({
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
        },
    },
    legalText: {
        userSelect: 'none',
        fontSize: 12,
        lineHeight: 1.75,
        color: theme.palette.text.hint,
        '& a': {
            textDecoration: 'none',
        },
    },
}))

export const Upload: React.FC = () => {
    const { t } = useI18N()
    const classes = useStyles()
    const history = useHistory()
    const [encrypted, setEncrypted] = React.useState(true)
    const recent = useAsync(() => Services.Plugin.invokePlugin(pluginId, 'getRecentFiles'), [])
    const onFile = async (file: File) => {
        let key: string | undefined = undefined
        if (encrypted) {
            key = makeFileKey()
        }
        const block = new Uint8Array(await file.arrayBuffer())
        const checksum = encodeArrayBuffer(await Attachment.checksum(block))
        const item = await Services.Plugin.invokePlugin(pluginId, 'getFileInfo', checksum)
        if (isNil(item) && key) {
            history.replace(FileRouter.uploading, {
                key,
                name: file.name,
                size: file.size,
                type: file.type,
                block,
                checksum,
            })
        } else {
            history.replace(FileRouter.uploaded, item)
        }
    }
    return (
        <section className={classes.container}>
            <section className={classes.upload}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
                <RecentFiles files={recent.value ?? []} />
            </section>
            <section className={classes.legal}>
                <FormControlLabel
                    control={<Checkbox checked={encrypted} onChange={(event, checked) => setEncrypted(checked)} />}
                    className={classes.encrypted}
                    label={t('plugin_file_service_on_encrypt_it')}
                />
                <Typography className={classes.legalText}>
                    <Trans
                        i18nKey="plugin_file_service_legal_text"
                        components={{
                            terms: <Link target="_blank" href={t('plugin_file_service_legal_terms_link')} />,
                            policy: <Link target="_blank" href={t('plugin_file_service_legal_policy_link')} />,
                        }}
                    />
                </Typography>
            </section>
        </section>
    )
}
