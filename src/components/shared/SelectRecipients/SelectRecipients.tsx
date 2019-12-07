import { Group, Person } from '../../../database'
import { makeStyles, Box } from '@material-ui/core'
import { PersonOrGroupInListProps } from '../SelectPeopleAndGroups'
import { GroupInChipProps, GroupInChip } from './GroupInChip'
import { PersonIdentifier, GroupIdentifier } from '../../../database/type'
import AddIcon from '@material-ui/icons/Add'
import { ClickableChip } from './ClickableChip'
import { useState } from 'react'
import { SelectRecipientsDialogUIProps, SelectRecipientsDialogUI } from './SelectRecipientsDialog'

export interface SelectRecipientsUIProps<T extends Group | Person = Group | Person>
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {
    /** Omit myself in the UI and the selected result */
    ignoreMyself?: boolean
    items: T[]
    selected: T[]
    frozenSelected: T[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    showAtNetwork?: boolean
    maxSelection?: number
    onSetSelected(selected: T[]): void
    GroupInChipProps?: Partial<GroupInChipProps>
    PersonOrGroupInListProps?: Partial<PersonOrGroupInListProps>
    SelectRecipientsDialogUIProps?: Partial<SelectRecipientsDialogUIProps>
}
const useStyles = makeStyles({
    root: {},
    selectArea: {
        display: 'flex',
        flexWrap: 'wrap',
    },
})
export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const classes = useStyles()
    const { items, onSetSelected } = props
    const groupItems = items.filter(item => isGroup(item)) as Group[]
    const personItems = items.filter(item => isPerson(item)) as Person[]

    const [open, setOpen] = useState(false)

    return (
        <div className={classes.root}>
            <Box className={classes.selectArea} display="flex">
                {groupItems.map(item => (
                    <GroupInChip
                        key={item.identifier.toText()}
                        item={item}
                        disabled={false}
                        onClick={() => {}}
                        {...props.GroupInChipProps}
                    />
                ))}
                <ClickableChip
                    ChipProps={{
                        label: 'Specific Friends (12 selected)',
                        avatar: <AddIcon />,
                        onClick() {
                            setOpen(true)
                        },
                    }}
                />
                <SelectRecipientsDialogUI
                    items={personItems}
                    open={open}
                    disabled={false}
                    submitDisabled={false}
                    onSubmit={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                    {...props.SelectRecipientsDialogUIProps}
                />
            </Box>
        </div>
    )
}

SelectRecipientsUI.defaultProps = {
    frozenSelected: [],
}

export function isPerson(x: Person | Group): x is Person {
    return x.identifier instanceof PersonIdentifier
}
export function isGroup(x: Person | Group): x is Group {
    return x.identifier instanceof GroupIdentifier
}
