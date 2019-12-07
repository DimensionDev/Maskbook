import Chip, { ChipProps } from '@material-ui/core/Chip'
import { Group } from '../../../database'
import DoneIcon from '@material-ui/icons/Done'
import { useResolveSpecialGroupName } from '../SelectPeopleAndGroups/resolveSpecialGroupName'
import { makeStyles } from '@material-ui/styles'

export interface GroupInChipProps {
    item: Group
    selected?: boolean
    disabled?: boolean
    onClick?(): void
    ChipProps?: ChipProps
}

const useStyles = makeStyles({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
    icon: {
        backgroundColor: 'transparent',
    },
})

export function GroupInChip(props: GroupInChipProps) {
    const classes = useStyles()
    const { selected, onClick } = props
    const group = props.item

    return (
        <Chip
            className={classes.root}
            avatar={selected ? <DoneIcon className={classes.icon} /> : undefined}
            color={selected ? 'primary' : 'default'}
            onClick={onClick}
            label={useResolveSpecialGroupName(group)}
            {...props.ChipProps}
        />
    )
}
