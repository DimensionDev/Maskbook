import type { HTMLProps } from 'react'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/i18n_generated.js'
import { type CompositionType, useCompositionContext } from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles()((theme) => ({
    chip: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
}))

interface SingleFileChipProps extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'size' | 'onClick'> {
    name: string
    size: string
    onClick(options: { compositionType: CompositionType }): void
}

export const SingleFileChip = ({ name, size, onClick, ...rest }: SingleFileChipProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    const { type } = useCompositionContext()
    return (
        <Typography
            className={classes.chip}
            {...rest}
            onClick={() => {
                onClick({ compositionType: type })
            }}>
            <Icons.FileService size={16} />
            {t.file_chip_single({ name, size })}
        </Typography>
    )
}

interface MultipleFileChipProps
    extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'onClick'>,
        Pick<SingleFileChipProps, 'onClick'> {
    count: number
}
export const MultipleFileChip = ({ count, onClick, ...rest }: MultipleFileChipProps) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const { type } = useCompositionContext()
    return (
        <Typography
            component="div"
            className={cx(classes.chip)}
            {...rest}
            onClick={() => {
                onClick({ compositionType: type })
            }}>
            <Icons.FileService size={16} />
            {t.file_chip_multiple({ count: count.toString() })}
        </Typography>
    )
}
