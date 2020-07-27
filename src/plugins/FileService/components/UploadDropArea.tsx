import { Typography, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import { isNil } from 'lodash-es'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useDropArea } from 'react-use'
import { formatFileSize } from '../utils'

const useStyles = makeStyles({
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
        color: '#2CA4EF',
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
    },
    uploader: {
        position: 'absolute',
        top: 38,
        userSelect: 'none',
    },
})

interface Props {
    maxFileSize: number
    onFile(file: File): void
}

export const UploadDropArea: React.FC<Props> = ({ maxFileSize, onFile }) => {
    const classes = useStyles()
    const snackbar = useSnackbar()
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
    const onError = (code: number) => {
        const messages: Record<number, string> = {
            101: 'The input is not a single file.',
            102: `The file is too large; limit is ${formatFileSize(maxFileSize)}.`,
        }
        if (code in messages) {
            snackbar.enqueueSnackbar(`Error ${code}: ${messages[code]}`, { variant: 'error' })
        }
    }
    return (
        <Typography component="label" {...bond} className={classNames(classes.label, { [classes.over]: over })}>
            <input type="file" onInput={onInput} hidden />
            <section className={classes.indicator}>Drop To Upload</section>
            <img className={classes.uploader} src="https://via.placeholder.com/64x64" />
            <b className={classes.here}>Drop a file here to upload</b>
            <p className={classes.hint}>Size limit: {formatFileSize(maxFileSize)}.</p>
            <p className={classes.hint}>The file will be uploaded immediately and cannot be cancelled.</p>
        </Typography>
    )
}
