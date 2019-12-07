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
export function SelectRecipientsUI<T extends Group | Person = Group | Person>(props: SelectRecipientsUIProps) {
    const classes = useStyles()
    const { items, maxSelection, selected, onSetSelected } = props
    const groupItems = items.filter(item => isGroup(item)) as Group[]
    const personItems = items.filter(item => isPerson(item)) as Person[]

    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)

    return (
        <div className={classes.root}>
            <Box className={classes.selectArea} display="flex">
                {groupItems.map(item => (
                    <GroupInChip
                        key={item.identifier.toText()}
                        item={item}
                        selected={selected.some(x => x.identifier.equals(item.identifier))}
                        disabled={false}
                        onClick={() => {
                            if (selected.some(x => x.identifier.equals(item.identifier))) {
                                onSetSelected(selected.filter(x => !x.identifier.equals(item.identifier)) as T[])
                            } else {
                                if (maxSelection === 1) onSetSelected([item as T])
                                else onSetSelected(selected.concat(item) as T[])
                            }
                            setSearch('')
                        }}
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
