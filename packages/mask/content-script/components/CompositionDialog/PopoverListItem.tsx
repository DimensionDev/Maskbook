import { makeStyles } from '@masknet/theme'
import { Box, FormControlLabel, Radio, Typography } from '@mui/material'
import { type ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: { marginLeft: 'unset', marginRight: 'unset' },
    label: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    mainTitle: {
        fontWeight: 700,
        fontSize: 14,
    },
    subTitle: {
        whiteSpace: 'nowrap',
        fontSize: 14,
    },
    pointer: {
        cursor: 'pointer',
    },
}))
interface PopoverListItemProps {
    value: string
    itemTail?: ReactNode
    title: ReactNode
    subTitle?: ReactNode
    disabled?: boolean
    onClick?: (v: string) => void
}
export function PopoverListItem(props: PopoverListItemProps) {
    const { title, subTitle, value, itemTail, disabled } = props
    const { classes, cx } = useStyles()
    return (
        <FormControlLabel
            classes={{
                root: classes.root,
                label: itemTail ? cx(classes.label, classes.pointer) : classes.label,
            }}
            disabled={disabled}
            value={value}
            control={<Radio />}
            onClick={() => props.onClick?.(value)}
            label={
                <>
                    <Box>
                        <Typography className={classes.mainTitle}>{title}</Typography>
                        <Typography className={classes.subTitle}>{subTitle}</Typography>
                    </Box>
                    {itemTail}
                </>
            }
        />
    )
}
