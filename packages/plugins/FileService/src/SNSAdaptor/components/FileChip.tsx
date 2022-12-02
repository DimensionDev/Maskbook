import type { FC, HTMLProps } from 'react'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    chip: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
}))

interface SingleFileChipProps extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'size'> {
    name: string
    size: string
}

export const SingleFileChip: FC<SingleFileChipProps> = ({ name, size, ...rest }) => {
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <Typography className={classes.chip} {...rest}>
            <Icons.FileService size={16} />
            {t.file_chip_single({ name, size })}
        </Typography>
    )
}

interface MultipleFileChipProps extends Omit<HTMLProps<HTMLDivElement>, 'ref'> {
    count: number
}
export const MultipleFileChip: FC<MultipleFileChipProps> = ({ count, ...rest }) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <Typography component="div" className={cx(classes.chip)} {...rest}>
            <Icons.FileService size={16} />
            {t.file_chip_multiple({ count: count.toString() })}
        </Typography>
    )
}
