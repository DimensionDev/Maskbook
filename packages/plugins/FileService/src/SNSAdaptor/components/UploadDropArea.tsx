import { Icons } from '@masknet/icons'
import { useCustomSnackbar, makeStyles } from '@masknet/theme'
import { alpha, Button, Typography } from '@mui/material'
import { isNil } from 'lodash-es'
import { type HTMLProps, memo, useRef } from 'react'
import { useDropArea } from 'react-use'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    dropArea: {
        display: 'flex',
        height: 230,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        borderRadius: 8,
        textAlign: 'center',
        padding: theme.spacing(3),
        overflow: 'hidden',
        userSelect: 'none',
        background: theme.palette.maskColor.whiteBlue,
    },
    dragOver: {
        borderColor: theme.palette.maskColor.primary,
    },
    uploadIcon: {
        height: 54,
        width: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        borderRadius: '50%',
        boxShadow:
            theme.palette.mode === 'dark' ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : '0px 4px 6px rgba(102, 108, 135, 0.1)',
    },
    tips: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.palette.maskColor.third,
        fontWeight: 700,
        marginTop: 10,
    },
    limit: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.palette.maskColor.third,
    },
    or: {
        marginTop: 10,
        color: theme.palette.maskColor.second,
    },
    button: {
        width: 164,
        marginTop: 10,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    maxFileSize: number
    onSelectFile(file: File): void
}

export const UploadDropArea = memo(({ maxFileSize, onSelectFile, className, ...rest }: Props) => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const inputRef = useRef<HTMLInputElement>(null)
    const [bond, { over }] = useDropArea({
        onFiles(files) {
            if (files.length > 1) {
                showMessage(101)
            } else if (files[0].size > maxFileSize) {
                showMessage(102)
            } else {
                onSelectFile(files[0])
            }
        },
        onText: () => showMessage(101),
        onUri: () => showMessage(101),
    })
    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.item(0)
        if (isNil(file)) {
            showMessage(101)
        } else if (file.size > maxFileSize) {
            showMessage(102)
        } else {
            onSelectFile(file)
        }
    }
    const showMessage = (code: 101 | 102) => {
        switch (code) {
            case 101:
                showSnackbar(t.error({ context: 'single', limit: '' }), { variant: 'error' })
                break
            case 102:
                showSnackbar(t.upload_file_title({ context: 'failed' }), {
                    variant: 'error',
                    message: t.upload_file_message({ context: 'failed' }),
                })
        }
    }
    return (
        <div className={cx(classes.dropArea, { [classes.dragOver]: over }, className)} {...rest} {...bond}>
            <input type="file" onInput={onInput} hidden ref={inputRef} />
            <div className={classes.uploadIcon}>
                <Icons.Upload size={30} />
            </div>
            <Typography className={classes.tips}>{t.drag_n_drop()}</Typography>
            <Typography className={classes.limit}>{t.size_limit()}</Typography>
            <Typography className={classes.or}>{t.or()}</Typography>
            <Button
                className={classes.button}
                color="info"
                variant="contained"
                onClick={() => {
                    inputRef.current?.click()
                }}>
                {t.browse_files()}
            </Button>
        </div>
    )
})
