import { t } from '@lingui/core/macro'
import { Select, Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/shared'
import { alpha, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { type HTMLProps, memo, type ReactNode, useCallback, useRef } from 'react'
import { useDropArea } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    dropArea: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
        alignItems: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        borderRadius: 8,
        textAlign: 'center',
        padding: theme.spacing(3),
        overflow: 'hidden',
        userSelect: 'none',
        background: theme.vars.palette.maskColor.whiteBlue,
    },
    dragOver: {
        borderColor: theme.vars.palette.maskColor.primary,
    },
    uploadIcon: {
        height: 54,
        width: 54,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.vars.palette.maskColor.bottom, 0.8),
        borderRadius: '50%',
        boxShadow: '0px 4px 6px rgba(102, 108, 135, 0.1)',
        ...theme.applyStyles('dark', { boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }),
    },
    tips: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.vars.palette.maskColor.main,
        fontWeight: 700,
    },
    limit: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.vars.palette.maskColor.second,
    },
    or: {
        color: theme.vars.palette.maskColor.second,
        fontWeight: 700,
    },
    button: {
        width: 164,
        marginBottom: 4,
        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.2)',
        backgroundColor: theme.vars.palette.maskColor.main,
        color: theme.vars.palette.maskColor.white,
        ...theme.applyStyles('dark', {
            boxShadow: 'none',
            color: theme.vars.palette.maskColor.bottom,
        }),
    },
}))

interface Props extends HTMLProps<HTMLDivElement>, withClasses<'button'> {
    maxFileSize?: number
    omitSizeLimit?: boolean
    accept?: string
    subtitle?: ReactNode
    onSelectFile(file: File): void
}

export const UploadDropArea = memo(function UploadDropArea(props: Props) {
    const { maxFileSize = Infinity, omitSizeLimit, className, accept, subtitle, onSelectFile, ...rest } = props
    const { classes, cx } = useStyles(undefined, { props })
    const { showSnackbar } = useCustomSnackbar()
    const handleFiles = (files: File[] | FileList | null) => {
        if (files?.length !== 1) {
            showMessage(101)
        } else if (!omitSizeLimit && files[0].size > maxFileSize) {
            showMessage(102)
        } else {
            onSelectFile(files[0])
        }
    }
    const fileSize = maxFileSize === Infinity ? t`unlimited` : formatFileSize(maxFileSize)
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
            input.remove()
        })
        input.click()
        document.body.append(input)
    }, [accept])
    const [bond, { over }] = useDropArea({
        onFiles: handleFiles,
        onText: () => showMessage(101),
        onUri: () => showMessage(101),
    })
    const showMessage = (code: 101 | 102 | 103) => {
        switch (code) {
            case 101:
                showSnackbar(<Trans>The input is not a single file.</Trans>, { variant: 'error' })
                break
            case 102:
                showSnackbar(<Trans>Failed to upload file</Trans>, {
                    variant: 'error',
                    message: <Trans>Exceeded the maximum file size of {fileSize}.</Trans>,
                })
                break
            case 103:
                showSnackbar(<Trans>Invalid file type</Trans>, {
                    variant: 'error',
                })
                break
        }
    }
    return (
        <div className={cx(classes.dropArea, { [classes.dragOver]: over }, className)} {...rest} {...bond}>
            <div className={classes.uploadIcon}>
                <Icons.Upload size={30} />
            </div>
            <div>
                <Typography className={classes.tips}>
                    <Trans>Drag & Drop your file here</Trans>
                </Typography>
                {subtitle ?? (
                    <Select
                        value={omitSizeLimit ? 'omit' : ''}
                        other={
                            <Typography className={classes.limit}>
                                <Trans>Size limit: {fileSize}</Trans>
                            </Typography>
                        }
                        _omit=""
                    />
                )}
            </div>
            <Typography className={classes.or}>
                <Trans>or</Trans>
            </Typography>
            <Button className={classes.button} variant="roundedContained" onClick={selectFile}>
                <Trans>Browse Files</Trans>
            </Button>
        </div>
    )
})
