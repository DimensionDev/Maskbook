import { Icons } from '@masknet/icons'
import { UploadDropArea } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Checkbox, FormControlLabel, Radio, Typography } from '@mui/material'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { MAX_FILE_SIZE } from '../../constants.js'
import { downloadFile } from '../../helpers.js'
import { Provider } from '../../types.js'
import { useFileManagement } from '../contexts/index.js'
import { FileList } from './FileList.js'
import { Trans } from '@lingui/macro'

interface ProviderConfig {
    name: ReactNode
    provider: Provider
}
const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
        paddingBottom: theme.spacing(2),
        boxSizing: 'border-box',
    },
    uploadArea: {
        display: 'flex',
        flexShrink: 0,
        margin: theme.spacing(2, 2, 0),
    },
    options: {
        display: 'flex',
        fontSize: 18,
        justifyContent: 'start',
        alignItems: 'center',
        height: 'fit-content',
        margin: theme.spacing(1.5, 2, 0),
    },
    control: {
        padding: 0,
        marginRight: theme.spacing(1),
    },
    checked: {
        color: theme.palette.maskColor.primary,
        boxShadow: '0px 4px 10px rgba(28, 104, 243, 0.2)',
    },
    label: {
        userSelect: 'none',
        marginLeft: 0,
    },
    heading: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.text.primary,
        margin: theme.spacing(3, 2, 0.5),
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

export function UploadFile() {
    const { classes, theme } = useStyles()
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
            name: <Trans>Arweave</Trans>,
        },
        {
            provider: Provider.IPFS,
            name: <Trans>IPFS</Trans>,
        },
    ]

    const onSelectFile = useCallback(
        async (file: File) => {
            await uploadFile(file, provider, useCDN, encrypted)
        },
        [encrypted, useCDN, provider],
    )

    const cdnButton =
        provider === Provider.Arweave ?
            <FormControlLabel
                control={
                    <Checkbox
                        classes={{ root: classes.control, checked: classes.checked }}
                        color="primary"
                        checked={useCDN}
                        icon={<Icons.CheckboxBlank size={18} />}
                        checkedIcon={<Icons.Checkbox color={theme.palette.maskColor.primary} size={18} />}
                        onChange={(event) => setUseCDN(event.target.checked)}
                    />
                }
                className={classes.label}
                label={<Trans>Use Meson CDN</Trans>}
            />
        :   null

    return (
        <section className={classes.container}>
            <UploadDropArea className={classes.uploadArea} maxFileSize={MAX_FILE_SIZE} onSelectFile={onSelectFile} />
            <div className={classes.options}>
                {providers.map((config: ProviderConfig) => (
                    <FormControlLabel
                        key={config.provider}
                        control={
                            <Radio
                                classes={{ root: classes.control, checked: classes.checked }}
                                color="primary"
                                checked={provider === config.provider}
                                icon={<Icons.RadioButtonUnChecked size={18} />}
                                checkedIcon={<Icons.RadioButtonChecked size={18} />}
                                onChange={() => setProvider(config.provider)}
                            />
                        }
                        className={classes.label}
                        label={config.name}
                    />
                ))}
            </div>
            <section className={classes.options}>
                <FormControlLabel
                    control={
                        <Checkbox
                            classes={{ root: classes.control, checked: classes.checked }}
                            size="small"
                            color="primary"
                            checked={encrypted}
                            icon={<Icons.CheckboxBlank size={18} />}
                            checkedIcon={<Icons.Checkbox color={theme.palette.maskColor.primary} size={18} />}
                            onChange={(event) => setEncrypted(event.target.checked)}
                        />
                    }
                    className={classes.label}
                    label={<Trans>Make It Encrypted</Trans>}
                />
                {cdnButton}
            </section>
            <Typography className={classes.heading}>
                <Trans>Uploaded files</Trans>
            </Typography>
            {files.length ?
                <FileList files={files} className={classes.fileList} onSend={attachToPost} onDownload={downloadFile} />
            :   <div className={classes.emptyBox}>
                    <Icons.EmptySimple size={36} />
                    <Typography className={classes.emptyMessage}>
                        <Trans>Please click Browse Files button to select files to upload.</Trans>
                    </Typography>
                </div>
            }
        </section>
    )
}
