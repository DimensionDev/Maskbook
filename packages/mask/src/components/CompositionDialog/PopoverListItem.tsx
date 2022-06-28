import { makeStyles } from '@masknet/theme'
import { Box, Radio, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { CheckCircle } from '@mui/icons-material'

const useStyles = makeStyles()((theme) => ({
    item: {
        display: 'flex',
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 14,
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    subTitle: {
        fontSize: 14,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    pointer: {
        cursor: 'pointer',
    },
}))
interface PopoverListItemProps {
    value: string
    itemTail?: ReactNode
    title: string
    subTitle?: string
    disabled?: boolean
    onItemClick?(): void
}
export function PopoverListItem(props: PopoverListItemProps) {
    const { title, subTitle, value, itemTail, disabled, onItemClick } = props
    const { classes, cx } = useStyles()
    return (
        <>
            <div
                style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                className={itemTail ? cx(classes.item, classes.pointer) : classes.item}
                onClick={onItemClick}>
                <Radio checkedIcon={<CheckCircle />} disabled={disabled} value={value} />
                <Box>
                    <Typography className={classes.mainTitle}>{title}</Typography>
                    <Typography className={classes.subTitle}>{subTitle}</Typography>
                </Box>
                {itemTail}
            </div>
        </>
    )
}
