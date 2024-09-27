import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import { FileFrame } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Checkbox, Typography } from '@mui/material'
import { memo } from 'react'
import type { FileBaseProps, FileInfo } from '../../../types.js'
import { Trans } from '@lingui/macro'

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
    file: FileInfo
    disabled?: boolean
    selected?: boolean
    onChange?(/** file id */ value: string, checked: boolean): void
}

export const SelectableFile = memo(({ file, selected, onChange, disabled, ...rest }: SelectableFileProps) => {
    const { classes, theme } = useStyles()

    return (
        <FileFrame
            fileName={file.name}
            {...rest}
            operations={
                <Checkbox
                    disabled={disabled}
                    checked={selected}
                    icon={<Icons.CheckboxBlank size={20} />}
                    checkedIcon={<Icons.Checkbox size={20} color={theme.palette.maskColor.primary} />}
                    onChange={(event) => {
                        onChange?.(file.id, event.currentTarget.checked)
                    }}
                />
            }>
            <Typography className={classes.desc}>{formatFileSize(file.size, true)}</Typography>
            {file.key ?
                <Typography className={classes.meta}>
                    <Trans>
                        File Key:{' '}
                        <Typography className={classes.metaValue} component="span">
                            {file.key}
                        </Typography>
                    </Trans>
                </Typography>
            :   null}
        </FileFrame>
    )
})

SelectableFile.displayName = 'SelectableFile'
