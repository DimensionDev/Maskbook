import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import DoneIcon from '@mui/icons-material/Done'
import Chip, { ChipProps } from '@mui/material/Chip'
import { noop } from 'lodash-unified'

export interface ClickableChipProps extends ChipProps {
    checked?: boolean
}

interface StyleProps {
    checked: boolean
}
const useStyles = makeStyles<StyleProps>()((theme, { checked }) => ({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
        ...(checked ? { color: theme.palette.text.buttonText, backgroundColor: theme.palette.text.primary } : {}),
        '&:hover': {
            color: theme.palette.text.primary,
            '& > svg': {
                color: `${theme.palette.text.primary} !important`,
            },
        },
    },
    icon: {
        backgroundColor: 'transparent !important',
        ...(checked ? { color: `${theme.palette.text.buttonText} !important` } : {}),
    },
    label: {
        display: 'flex',
    },
}))

export function ClickableChip(props: ClickableChipProps) {
    const { classes } = useStyles({ checked: Boolean(props.checked) })
    return (
        <Chip
            deleteIcon={props.checked ? <DoneIcon className={classes.icon} /> : undefined}
            onDelete={props.checked ? noop : undefined}
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
