import { formatFileSize } from '@dimensiondev/kit'
import { useCustomSnackbar } from '@masknet/theme'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isNil } from 'lodash-unified'
import { UploadCloud } from 'react-feather'
import { useDropArea } from 'react-use'
import { useI18N } from '../../locales/i18n_generated'

const useStyles = makeStyles()((theme) => ({
    label: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
        border: '1px dashed #C4C4C4',
        boxSizing: 'border-box',
        borderRadius: 4,
        textAlign: 'center',
        flex: 1,
        padding: 12,
        overflow: 'hidden',
        userSelect: 'none',
    },
    here: {
        fontSize: 14,
        lineHeight: 2.5,
        color: theme.palette.grey[100],
        userSelect: 'none',
    },
    hint: {
        margin: 0,
        color: '#939393',
        fontSize: 12,
        lineHeight: 1.5,
        userSelect: 'none',
    },
    over: {
        borderColor: '#2CA4EF',
        borderStyle: 'solid',
        userSelect: 'none',
        '& > $indicator': { opacity: 1 },
    },
    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
        cursor: 'pointer',
        transition: 'all 500ms ease-out',
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        fontSize: 30,
        color: '#2CA4EF',
        userSelect: 'none',
        zIndex: 1,
    },
    uploader: {
        position: 'absolute',
        top: 38,
        userSelect: 'none',
        cursor: 'pointer',
        zIndex: 0,
    },
}))

interface Props {
    maxFileSize: number
    onFile(file: File): void
}

export const UploadDropArea: React.FC<Props> = ({ maxFileSize, onFile }) => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const [bond, { over }] = useDropArea({
        onFiles(files) {
            if (files.length > 1) {
                onError(101)
            } else if (files[0].size > maxFileSize) {
                onError(102)
            } else {
                onFile(files[0])
            }
        },
        onText: () => onError(101),
        onUri: () => onError(101),
    })
    const MAX_FILE_SIZE = formatFileSize(maxFileSize)
    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.item(0)
        if (isNil(file)) {
            onError(101)
        } else if (file.size > maxFileSize) {
            onError(102)
        } else {
            onFile(file)
        }
    }
    // error code definition:
    // see https://confluence.dimension.chat/x/3IEf#Maskbook:Plugin:FileService-ErrorHandling
    const onError = (code: number) => {
        const messages: Record<number, string> = {
            101: t.error_101(),
            102: t.error_102({ limit: MAX_FILE_SIZE }),
        }
        if (code in messages) {
            showSnackbar(`Error ${code}: ${messages[code]}`, { variant: 'error' })
        }
    }
    return (
        <Typography component="label" {...bond} className={cx(classes.label, { [classes.over]: over })}>
            <input type="file" onInput={onInput} hidden />
            <section className={classes.indicator}>{t.drop_indicator()}</section>
            <UploadCloud className={classes.uploader} width={64} height={64} />
            <b className={classes.here}>{t.drop_here()}</b>
            <p className={classes.hint}>{t.drop_hint_1({ limit: MAX_FILE_SIZE })}</p>
            <p className={classes.hint}>{t.drop_hint_2()}</p>
        </Typography>
    )
}
