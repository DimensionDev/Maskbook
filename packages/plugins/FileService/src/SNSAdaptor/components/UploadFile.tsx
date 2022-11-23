import { useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Checkbox, Radio, FormControlLabel, Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import type { ProviderConfig } from '../../types.js'
import { MAX_FILE_SIZE } from '../../constants.js'
import { FileList } from './FileList.js'
import { UploadDropArea } from './UploadDropArea.js'
import { Provider } from '../../types.js'
import { Icons } from '@masknet/icons'
import { useFileManagement } from '../contexts/index.js'
import { downloadFile } from '../../helpers.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    uploadArea: {
        display: 'flex',
        flexShrink: 0,
        margin: theme.spacing(2, 2, 0),
    },
    checkItems: {
        display: 'flex',
        fontSize: 18,
        justifyContent: 'start',
        alignItems: 'center',
        height: 'fit-content',
        margin: theme.spacing(1.5, 2, 0),
    },
    encrypted: {
        userSelect: 'none',
    },
    usedCDN: {
        userSelect: 'none',
    },
    heading: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.text.primary,
        margin: theme.spacing(0, 2, 0.5),
    },
    fileList: {
        flexGrow: 1,
        overflow: 'auto',
        marginTop: theme.spacing(1),
    },
    emptyBox: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(1.5),
    },
}))

export const UploadFile: React.FC = () => {
    const t = useI18N()
    const { classes } = useStyles()
    const [encrypted, setEncrypted] = useState(true)
    const [useCDN, setUseCDN] = useState(false)
    const [provider, setProvider] = useState<Provider>(Provider.Arweave)
    const { recentFiles, uploadingFiles, uploadFile, attachToPost } = useFileManagement()

    const files = useMemo(() => {
        return [...uploadingFiles, ...recentFiles]
    }, [uploadingFiles, recentFiles])

    const providers: ProviderConfig[] = [
        {
            provider: Provider.Arweave,
            name: t.provider_arweave(),
        },
        {
            provider: Provider.IPFS,
            name: t.provider_ipfs(),
        },
    ]

    const onSelectFile = useCallback(
        async (file: File) => {
            await uploadFile(file, provider, useCDN, encrypted)
        },
        [encrypted, useCDN, provider],
    )

    const cdnButton =
        provider === Provider.Arweave ? (
            <FormControlLabel
                control={
                    <Checkbox
                        color="primary"
                        checked={useCDN}
                        icon={<Icons.CheckboxBlank size={18} />}
                        checkedIcon={<Icons.Checkbox size={18} />}
                        onChange={(event) => setUseCDN(event.target.checked)}
                    />
                }
                className={classes.usedCDN}
                label={t.use_cdn()}
            />
        ) : null

    return (
        <section className={classes.container}>
            <UploadDropArea className={classes.uploadArea} maxFileSize={MAX_FILE_SIZE} onSelectFile={onSelectFile} />
            <div className={classes.checkItems}>
                {providers.map((config: ProviderConfig) => (
                    <FormControlLabel
                        key={config.provider}
                        control={
                            <Radio
                                color="primary"
                                checked={provider === config.provider}
                                icon={<Icons.RadioButtonUnChecked size={18} />}
                                checkedIcon={<Icons.RadioButtonChecked size={18} />}
                                onChange={() => setProvider(config.provider)}
                            />
                        }
                        className={classes.encrypted}
                        label={config.name}
                    />
                ))}
            </div>
            <section className={classes.checkItems}>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            color="primary"
                            checked={encrypted}
                            icon={<Icons.CheckboxBlank size={18} />}
                            checkedIcon={<Icons.Checkbox size={18} />}
                            onChange={(event) => setEncrypted(event.target.checked)}
                        />
                    }
                    className={classes.encrypted}
                    label={t.on_encrypt_it()}
                />
                {cdnButton}
            </section>
            <Typography className={classes.heading}>{t.uploaded_files()}</Typography>
            {files.length ? (
                <FileList files={files} className={classes.fileList} onSend={attachToPost} onDownload={downloadFile} />
            ) : (
                <div className={classes.emptyBox}>
                    <Icons.EmptySimple size={36} />
                    <Typography className={classes.emptyMessage}>{t.upload_tips()}</Typography>
                </div>
            )}
        </section>
    )
}
