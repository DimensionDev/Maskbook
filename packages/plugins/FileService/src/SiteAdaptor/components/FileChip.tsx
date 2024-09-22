import type { HTMLProps } from 'react'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { type CompositionType, useCompositionContext } from '@masknet/plugin-infra/content-script'
import { Trans } from '@lingui/macro'

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

export function SingleFileChip({ name, size, onClick, ...rest }: SingleFileChipProps) {
    const { classes } = useStyles()
    const { type } = useCompositionContext()
    return (
        <Typography
            className={classes.chip}
            {...rest}
            onClick={() => {
                onClick({ compositionType: type })
            }}>
            <Icons.FileService size={16} />
            <Trans>
                Attached File: {name} ({size})
            </Trans>
        </Typography>
    )
}

interface MultipleFileChipProps
    extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'onClick'>,
        Pick<SingleFileChipProps, 'onClick'> {
    count: number
}
export function MultipleFileChip({ count, onClick, ...rest }: MultipleFileChipProps) {
    const { classes, cx } = useStyles()
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
            <Trans>{count.toString()} files selected</Trans>
        </Typography>
    )
}
