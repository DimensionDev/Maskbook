import { useState, useRef, useEffect } from 'react'
import { useDropArea } from 'react-use'
import { makeStyles } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { RestoreBox } from './RestoreBox'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { QRCodeImageScanner } from './QRCodeImageScanner'
import { blobToDataURL } from '@dimensiondev/kit'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: 112,
    },
    file: {
        display: 'none',
    },
    qr: {
        maxWidth: 64,
        maxHeight: 64,
        display: 'block',
    },
    restoreBoxRoot: {
        boxSizing: 'border-box',
        border: `solid 1px ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'center',
        height: 112,
        marginBottom: 16,
        borderRadius: 4,
    },
    restoreBoxPlaceholder: {
        marginTop: 0,
        marginBottom: 6,
    },
}))

export interface RestoreFromQRCodeImageBoxProps extends withClasses<never> {
    file: File | null
    onScan?: (content: string) => void
    onError?: () => void
    onChange?: (file: File | null) => void
}

export function RestoreFromQRCodeImageBox(props: RestoreFromQRCodeImageBoxProps) {
    const { file, onScan, onError, onChange } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [dataURL, setDataURL] = useState('')

    const inputRef = useRef<HTMLInputElement>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            onChange?.(files[0])
        },
    })

    // read file as data URL
    useEffect(() => {
        if (file) {
            blobToDataURL(file).then(setDataURL, () => setDataURL(''))
        } else {
            setDataURL('')
        }
    }, [file])

    // invoke onChange callback
    useEffect(() => onChange?.(file), [file, onChange])

    return (
        <div className={classes.root} {...bound}>
            <input
                className={classes.file}
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                    if (currentTarget.files) onChange?.(currentTarget.files.item(0))
                }}
            />
            <RestoreBox
                classes={{ root: classes.restoreBoxRoot, placeholder: classes.restoreBoxPlaceholder }}
                file={file}
                entered={over}
                enterText={t('restore_database_advance_dragging')}
                leaveText={t('restore_database_advance_dragged')}
                darkPlaceholderImageURL={new URL('./RestoreFromQRCodeImageBox-dark.png', import.meta.url).toString()}
                lightPlaceholderImageURL={new URL('./RestoreFromQRCodeImageBox-light.png', import.meta.url).toString()}
                data-active={over}
                onClick={() => inputRef.current && inputRef.current.click()}>
                {file ? <QRCodeImageScanner src={dataURL} onScan={onScan} onError={onError} /> : null}
            </RestoreBox>
        </div>
    )
}
