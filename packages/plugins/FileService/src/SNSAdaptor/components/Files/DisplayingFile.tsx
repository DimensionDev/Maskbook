import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { memo } from 'react'
import { Translate } from '../../../locales/index.js'
import type { FileInfo } from '../../../types.js'
import { type FileBaseProps, FileFrame } from './FileFrame.js'

const useStyles = makeStyles()((theme) => ({
    desc: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
    },
    meta: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
    },
    metaValue: {
        color: theme.palette.maskColor.second,
    },
    operations: {
        display: 'flex',
        alignItems: 'center',
    },
    operationButton: {
        color: theme.palette.maskColor.white,
        marginLeft: theme.spacing(1),
    },
}))

export interface DisplayingFileProps extends FileBaseProps {
    onSave?(file: FileInfo): void
    onDownload?(file: FileInfo): void
}

export const DisplayingFile = memo(({ file, onSave, onDownload, ...rest }: DisplayingFileProps) => {
    const { classes } = useStyles()

    return (
        <FileFrame
            file={file}
            {...rest}
            operations={
                <div className={classes.operations}>
                    <Button
                        className={classes.operationButton}
                        size="small"
                        variant="roundedDark"
                        onClick={() => onSave?.(file)}>
                        <Icons.Dump size={16} />
                    </Button>
                    <Button
                        className={classes.operationButton}
                        size="small"
                        variant="roundedDark"
                        onClick={() => onDownload?.(file)}>
                        <Icons.Download2 size={16} />
                    </Button>
                </div>
            }>
            <Typography className={classes.desc}>{formatFileSize(file.size, true)}</Typography>
            {file.key ? (
                <Typography className={classes.meta}>
                    <Translate.file_key
                        components={{
                            key: <Typography className={classes.metaValue} component="span" />,
                        }}
                        values={{ key: file.key }}
                    />
                </Typography>
            ) : null}
        </FileFrame>
    )
})

DisplayingFile.displayName = 'DisplayingFile'
