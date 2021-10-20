import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import DoneIcon from '@mui/icons-material/Done'
import Chip, { ChipProps } from '@mui/material/Chip'

export interface ClickableChipProps extends ChipProps {
    checked?: boolean
}
const useStyles = makeStyles()({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
    icon: {
        backgroundColor: 'transparent !important',
    },
    label: {
        display: 'flex',
    },
})

export function ClickableChip(props: ClickableChipProps) {
    const { classes } = useStyles()
    return (
        <Chip
            avatar={props.checked ? <DoneIcon className={classes.icon} /> : undefined}
            color={props.checked ? 'primary' : 'default'}
            {...props}
            classes={{
                ...props.classes,
                root: classNames(classes.root, props.classes?.root),
                label: classNames(classes.label, props.classes?.label),
            }}
        />
    )
}
