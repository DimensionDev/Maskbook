import { makeStyles } from '@masknet/theme'
import { Done as DoneIcon } from '@mui/icons-material'
import { Chip, type ChipProps } from '@mui/material'
import { noop } from 'lodash-es'

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
    const { classes, cx } = useStyles({ checked: !!props.checked })
    return (
        <Chip
            deleteIcon={props.checked ? <DoneIcon className={classes.icon} /> : undefined}
            onDelete={props.checked ? noop : undefined}
            color={props.checked ? 'primary' : 'default'}
            {...props}
            classes={{
                ...props.classes,
                root: cx(classes.root, props.classes?.root),
                label: cx(classes.label, props.classes?.label),
            }}
        />
    )
}
