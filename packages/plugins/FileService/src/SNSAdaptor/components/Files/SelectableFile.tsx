import { FC, memo } from 'react'
import { Checkbox, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatFileSize } from '@masknet/kit'
import { Translate } from '../../../locales/index.js'
import { FileBaseProps, FileFrame } from './FileFrame.js'

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
}))

interface SelectableFileProps extends Omit<FileBaseProps, 'onChange'> {
    disabled?: boolean
    selected?: boolean
    onChange?(/** file id */ value: string, checked: boolean): void
}

export const SelectableFile: FC<SelectableFileProps> = memo(({ file, selected, onChange, disabled, ...rest }) => {
    const { classes } = useStyles()

    return (
        <FileFrame
            file={file}
            {...rest}
            operations={
                <Checkbox
                    disabled={disabled}
                    checked={selected}
                    onChange={(event) => {
                        onChange?.(file.id, event.currentTarget.checked)
                    }}
                />
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

SelectableFile.displayName = 'SelectableFile'
