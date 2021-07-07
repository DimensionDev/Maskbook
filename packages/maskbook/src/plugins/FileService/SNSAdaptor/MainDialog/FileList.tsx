import { formatFileSize } from '@dimensiondev/kit'
import { Checkbox, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core'
import { memo, useEffect, useState } from 'react'
import { FileIcon } from './File'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
const useStyles = makeStyles((theme) => ({
    icon: {
        alignItems: 'center',
    },
    arrow: {
        justifyContent: 'flex-end',
    },
    size: {
        textAlign: 'right',
    },
    text: {},
}))
export interface UploadFilesListProps {
    files: File[]
    onChange: (files: File[]) => void
}

export const UploadFilesList = memo<UploadFilesListProps>(({ files, onChange }) => {
    const classes = useStyles()
    const [selsectedFiles, setSelectedFiles] = useState<File[]>([])

    const onClick = (value: number) => {
        if (selsectedFiles.some((x) => x === files[value])) {
            setSelectedFiles(selsectedFiles.filter((x) => x !== files[value]))
        } else {
            setSelectedFiles([...selsectedFiles, files[value]])
        }
    }

    useEffect(() => {
        onChange(selsectedFiles)
    }, [onChange, selsectedFiles])

    const RenderItem = (file: File, idx: number) => (
        <ListItem role="Listitem" button key={idx} onClick={() => onClick(idx)}>
            <ListItemIcon className={classes.icon}>
                <Checkbox checked={selsectedFiles.some((x) => x === file)} tabIndex={-1} disableRipple />
                <FileIcon width={32} height={32} />
            </ListItemIcon>
            <ListItemText disableTypography primary={file.name} primaryTypographyProps={{ className: classes.text }} />
            <ListItemText className={classes.size} primary={formatFileSize(file.size)} />
            <ListItemIcon className={classes.arrow}>
                <ArrowForwardIosIcon />
            </ListItemIcon>
        </ListItem>
    )
    return (
        <List dense role="list">
            {files.map(RenderItem)}
        </List>
    )
})
