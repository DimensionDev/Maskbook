import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import { Checkbox, Radio, FormControlLabel, Link, Typography } from '@mui/material'
import { isNil } from 'lodash-unified'
import { useI18N, Translate } from '../../locales/i18n_generated.js'
import { makeFileKey } from '../../file-key.js'
import type { ProviderConfig } from '../../types.js'
import { FileRouter, MAX_FILE_SIZE } from '../../constants.js'
import { PluginFileServiceRPC } from '../../Worker/rpc.js'
import { RecentFiles } from './RecentFiles.js'
import { UploadDropArea } from './UploadDropArea.js'
import { Provider } from '../../types.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
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

export const Prepare: React.FC = () => {
    const t = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [encrypted, setEncrypted] = useState(true)
    const [useCDN, setUseCDN] = useState(false)
    const [provider, setProvider] = useState<Provider>(Provider.arweave)
    const recent = useAsync(() => PluginFileServiceRPC.getRecentFiles(), [])
    const allProviders: ProviderConfig[] = [
        {
            provider: Provider.arweave,
            name: t.provider_arweave(),
        },
        {
            provider: Provider.ipfs,
            name: t.provider_ipfs(),
        },
        {
            provider: Provider.swarm,
            name: t.provider_swarm(),
        },
    ]

    const onFile = useCallback(
        async (file: File) => {
            const key = encrypted ? makeFileKey() : undefined
            const block = new Uint8Array(await file.arrayBuffer())
            const checksum = encodeArrayBuffer(await Attachment.checksum(block))
            const item = await PluginFileServiceRPC.getFileInfo(checksum)
            if (isNil(item)) {
                navigate(FileRouter.Uploading, {
                    state: {
                        key,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        block,
                        checksum,
                        useCDN,
                        provider,
                        encrypted,
                    },
                })
            } else {
                navigate(FileRouter.Uploaded, { state: item })
            }
        },
        [encrypted, useCDN, provider],
    )

    const allProviderOptions = allProviders.map((config: ProviderConfig) => (
        <FormControlLabel
            key={config.provider}
            control={
                <Radio
                    color="primary"
                    checked={provider === config.provider}
                    onChange={() => setProvider(config.provider)}
                />
            }
            className={classes.encrypted}
            label={config.name}
        />
    ))

    const cdnButton =
        provider === Provider.arweave ? (
            <FormControlLabel
                control={
                    <Checkbox color="primary" checked={useCDN} onChange={(event) => setUseCDN(event.target.checked)} />
                }
                className={classes.usedCDN}
                label={t.use_cdn()}
            />
        ) : null

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
                            color="primary"
                            checked={encrypted}
                            onChange={(event) => setEncrypted(event.target.checked)}
                        />
                    }
                    className={classes.encrypted}
                    label={t.on_encrypt_it()}
                />
                {cdnButton}
            </section>
            <section className={classes.checkItems}>{allProviderOptions}</section>
            <section className={classes.legal}>
                <Typography className={classes.legalText}>
                    <Translate.legal_text
                        components={{
                            terms: <Link target="_blank" href={t.legal_terms_link()} />,
                            policy: <Link target="_blank" href={t.legal_policy_link()} />,
                        }}
                    />
                </Typography>
            </section>
        </section>
    )
}
