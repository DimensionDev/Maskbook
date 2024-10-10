import { Icons } from '@masknet/icons'
import { useCustomSnackbar, makeStyles } from '@masknet/theme'
import { alpha, Button, Typography } from '@mui/material'
import { type HTMLProps, memo, useCallback, useRef } from 'react'
import { useDropArea } from 'react-use'
import { useSharedTrans } from '../../../index.js'
import { Select, Trans } from '@lingui/macro'

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
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        marginTop: 10,
    },
    limit: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    or: {
        marginTop: 10,
        color: theme.palette.maskColor.second,
    },
    button: {
        width: 164,
        marginTop: 10,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 8px 25px rgba(0, 0, 0, 0.2)',
        backgroundColor: theme.palette.maskColor.main,
        color: theme.palette.mode === 'dark' ? theme.palette.maskColor.bottom : theme.palette.maskColor.white,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    maxFileSize?: number
    omitSizeLimit?: boolean
    accept?: string
    onSelectFile(file: File): void
}

export const UploadDropArea = memo(
    ({ maxFileSize = Number.POSITIVE_INFINITY, omitSizeLimit, onSelectFile, className, accept, ...rest }: Props) => {
        const t = useSharedTrans()
        const { classes, cx } = useStyles()
        const { showSnackbar } = useCustomSnackbar()
        const handleFiles = (files: File[] | FileList | null) => {
            if (!files || files.length !== 1) {
                showMessage(101)
            } else if (!omitSizeLimit && files[0].size > maxFileSize) {
                showMessage(102)
            } else {
                onSelectFile(files[0])
            }
        }
        const handleFilesRef = useRef<(file: File[] | FileList | null) => void>(undefined)
        handleFilesRef.current = handleFiles

        const selectFile = useCallback(() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.hidden = true
            if (accept) input.accept = accept
            input.addEventListener('input', function onInput(event) {
                handleFilesRef.current?.((event.currentTarget as any).files as FileList)
                input.removeEventListener('input', onInput)
                document.body.removeChild(input)
            })
            input.click()
            document.body.append(input)
        }, [accept])
        const [bond, { over }] = useDropArea({
            onFiles: handleFiles,
            onText: () => showMessage(101),
            onUri: () => showMessage(101),
        })
        const showMessage = (code: 101 | 102) => {
            switch (code) {
                case 101:
                    showSnackbar(t.upload_error({ context: 'single', limit: '' }), { variant: 'error' })
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
                <div className={classes.uploadIcon}>
                    <Icons.Upload size={30} />
                </div>
                <Trans>
                    <Typography className={classes.tips}>Drag & Drop your file here </Typography>
                    <Select
                        value={omitSizeLimit ? 'omit' : null}
                        default={<Typography className={classes.limit}>Size limit: 10 MB </Typography>}
                        _omit=""
                    />
                    <Typography className={classes.or}>or </Typography>
                    <Button className={classes.button} variant="contained" onClick={selectFile}>
                        Browse File
                    </Button>
                </Trans>
            </div>
        )
    },
)
