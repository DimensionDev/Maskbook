import { formatFileSize } from '@dimensiondev/kit'
import { Checkbox, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import { memo, useEffect, useState } from 'react'
import { FileIcon } from './File'

const useStyles = makeStyles()({
    icon: {
        alignItems: 'center',
    },
    arrow: {
        justifyContent: 'flex-end',
    },
    size: {
        textAlign: 'right',
    },
})

export interface UploadFilesListProps {
    files: File[]
    onChange: (files: File[]) => void
}

export const UploadFilesList = memo<UploadFilesListProps>(({ files, onChange }) => {
    const { classes } = useStyles()
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const onClick = (value: number) => {
        if (selectedFiles.some((x) => x === files[value])) {
            setSelectedFiles(selectedFiles.filter((x) => x !== files[value]))
        } else {
            setSelectedFiles([...selectedFiles, files[value]])
        }
    }

    useEffect(() => {
        onChange(selectedFiles)
    }, [onChange, selectedFiles])
    const RenderItem = (file: File, idx: number) => (
        <ListItem role="Listitem" button key={idx} onClick={() => onClick(idx)}>
            <ListItemIcon className={classes.icon}>
                <Checkbox checked={selectedFiles.some((x) => x === file)} tabIndex={-1} disableRipple />
                <FileIcon width={32} height={32} />
            </ListItemIcon>
            <ListItemText disableTypography primary={file.name} />
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
