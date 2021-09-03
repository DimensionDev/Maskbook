import { MaskColorVar } from '@masknet/theme'
import { Card, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useEffect, useState } from 'react'
import { File as FileIcon } from '@masknet/icons'
import { blobToText } from '@dimensiondev/kit'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        borderRadius: 8,
    },
    container: {
        textAlign: 'center',
    },
    file: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0,
        cursor: 'pointer',
    },
    text: {
        color: MaskColorVar.textSecondary,
        fontSize: 13,
    },
})

export interface FileUploadProps {
    width?: number
    height?: number
    readAsText?: boolean
    onChange: (file: File, content?: string) => void
    accept?: string
}

export default function FileUpload({ width, height, readAsText, onChange, accept }: FileUploadProps) {
    const { classes } = useStyles()
    const [file, setFile] = useState<File | null>()

    const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        if (target.files) {
            setFile(target.files[0])
        }
    }

    useEffect(() => {
        if (file) {
            if (readAsText) {
                blobToText(file).then((result) => onChange(file, result))
            } else {
                onChange(file)
            }
        }
    }, [file, readAsText, onChange])
    return (
        <Card variant="background" className={classes.root} style={{ width, height }}>
            <div className={classes.container}>
                <FileIcon />
                <Typography className={classes.text}>Please click or drag the file to here</Typography>
            </div>
            <input type="file" className={classes.file} accept={accept} onChange={handleChange} />
        </Card>
    )
}
