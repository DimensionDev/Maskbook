import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import DoneIcon from '@mui/icons-material/Done'
import Chip, { ChipProps } from '@mui/material/Chip'

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
