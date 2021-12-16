import { Attachment } from '@dimensiondev/common-protocols'
import { blobToArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import { Checkbox, Radio, FormControlLabel, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isNil } from 'lodash-unified'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useAsync } from 'react-use'
import { useI18N } from '../../../../utils'
import { makeFileKey } from '../../file-key'
import type { ProviderConfig } from '../../types'
import { FileRouter, MAX_FILE_SIZE } from '../../constants'
import { PluginFileServiceRPC } from '../../Worker/rpc'
import { RecentFiles } from './RecentFiles'
import { UploadDropArea } from './UploadDropArea'
import { Provider } from '../../types'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: 260,
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
    checkItems: {
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
        height: 'fit-content',
    },
    encrypted: {
        userSelect: 'none',
        '& span': { fontSize: 12, lineHeight: 1.75 },
    },
    usedCDN: {
        userSelect: 'none',
        '& span': { fontSize: 12, lineHeight: 1.75 },
    },
    legalText: {
        userSelect: 'none',
        fontSize: 12,
        lineHeight: 1.75,
        color: theme.palette.text.secondary,
        '& a': { textDecoration: 'none' },
    },
}))

export const Upload: React.FC = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()
    const [encrypted, setEncrypted] = useState(true)
    const [useCDN, setUseCDN] = useState(false)
    const [provider, setProvider] = useState('arweave')
    const recent = useAsync(() => PluginFileServiceRPC.getRecentFiles(), [])
    const allProviders: ProviderConfig[] = [
        {
            provider: Provider.arweave,
            name: t('plugin_file_service_provider_arweave'),
        },
        {
            provider: Provider.ipfs,
            name: t('plugin_file_service_provider_ipfs'),
        },
        {
            provider: Provider.swarm,
            name: t('plugin_file_service_provider_swarm'),
        },
    ]

    const onFile = async (file: File) => {
        let key: string | undefined = undefined
        if (encrypted) {
            key = makeFileKey()
        }
        const block = new Uint8Array(await blobToArrayBuffer(file))
        const checksum = encodeArrayBuffer(await Attachment.checksum(block))
        const item = await PluginFileServiceRPC.getFileInfo(checksum)
        if (isNil(item)) {
            history.replace(FileRouter.uploading, {
                key,
                name: file.name,
                size: file.size,
                type: file.type,
                block,
                checksum,
                useCDN,
                provider,
            })
        } else {
            history.replace(FileRouter.uploaded, item)
        }
    }

    const allProviderdOptions = allProviders.map((config: ProviderConfig) => (
        <FormControlLabel
            control={
                <Radio
                    color="secondary"
                    checked={provider === config.provider}
                    onChange={() => setProvider(config.provider)}
                />
            }
            label={config.name}
        />
    ))

    let cdnButton = null
    if (provider === Provider.arweave) {
        cdnButton = (
            <FormControlLabel
                control={
                    <Checkbox
                        color="secondary"
                        checked={useCDN}
                        onChange={(event) => setUseCDN(event.target.checked)}
                    />
                }
                className={classes.usedCDN}
                label={t('plugin_file_service_use_cdn')}
            />
        )
    }

    return (
        <section className={classes.container}>
            <section className={classes.upload}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
                <RecentFiles files={recent.value ?? []} />
            </section>
            <section className={classes.checkItems}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="secondary"
                            checked={encrypted}
                            onChange={(event) => setEncrypted(event.target.checked)}
                        />
                    }
                    className={classes.encrypted}
                    label={t('plugin_file_service_on_encrypt_it')}
                />
                {cdnButton}
            </section>
            <section className={classes.checkItems}>{allProviderdOptions}</section>
            <section className={classes.legal}>
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
