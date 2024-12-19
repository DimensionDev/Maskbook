import { FileFrame, formatFileSize } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { LinearProgress, linearProgressClasses, Typography } from '@mui/material'
import { memo } from 'react'
import type { FileBaseProps, FileInfo } from '../../../types.js'

const useStyles = makeStyles()((theme) => ({
    desc: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
        marginTop: 7,
    },
    progressBar: {
        height: 4,
        marginTop: 7,
        borderRadius: 2,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 2,
            backgroundColor: theme.palette.maskColor.success,
        },
    },
}))

interface UploadingFileProps extends FileBaseProps {
    file: FileInfo
    progress?: number
}

export const UploadingFile = memo(({ file, progress, ...rest }: UploadingFileProps) => {
    const { classes } = useStyles()

    return (
        <FileFrame fileName={file.name} {...rest}>
            <LinearProgress
                className={classes.progressBar}
                variant={progress === 0 ? 'indeterminate' : 'determinate'}
                value={progress}
            />
            <Typography className={classes.desc}>{formatFileSize(file.size)}</Typography>
        </FileFrame>
    )
})

UploadingFile.displayName = 'UploadingFile'
