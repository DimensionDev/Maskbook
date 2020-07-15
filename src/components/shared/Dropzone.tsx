import React, { useRef } from 'react'
import { useDropArea } from 'react-use'
import { makeStyles, createStyles } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'

type DropzoneProps = {
    onImgChange: (img: File) => Promise<void>
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            height: 120,
        },
        file: {
            display: 'flex',
        },
        qr: {
            maxWidth: 64,
            maxHeight: 64,
            display: 'block',
        },
        restoreBoxRoot: {
            overflow: 'auto',
            boxSizing: 'border-box',
            border: `solid 1px ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center',
            height: 120,
            marginBottom: 16,
            borderRadius: 4,
        },
        restoreBoxPlaceholder: {
            marginBottom: 6,
        },
    }),
)

const Dropzone: React.FC<DropzoneProps> = ({ onImgChange }) => {
    const classes = useStylesExtends(useStyles(), {})
    const inputRef = useRef<HTMLInputElement>(null)
    const [bound, _] = useDropArea({
        onFiles(files) {
            onImgChange?.(files[0])
        },
    })

    return (
        <div className={classes.root} {...bound}>
            <input
                className={classes.file}
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                    const files = currentTarget.files
                    if (!files) {
                        return
                    }
                    const file = files.item(0)
                    if (!file) {
                        return
                    }
                    // TODO: remove me
                    console.log('file', file)
                    console.log('onImgChange', onImgChange)
                    onImgChange?.(file)
                }}
            />
        </div>
    )
}

export default Dropzone
