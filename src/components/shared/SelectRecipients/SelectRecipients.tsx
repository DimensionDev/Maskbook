import * as React from 'react'
import { Group, Profile } from '../../../database'
import { makeStyles, Box } from '@material-ui/core'
import { PersonOrGroupInListProps } from '../SelectPeopleAndGroups'
import { GroupInChipProps, GroupInChip } from './GroupInChip'
import { ProfileIdentifier, GroupIdentifier } from '../../../database/type'
import AddIcon from '@material-ui/icons/Add'
import { ClickableChip } from './ClickableChip'
import { useState, useEffect } from 'react'
import { SelectRecipientsDialogUIProps, SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { geti18nString } from '../../../utils/i18n'
import { difference } from 'lodash-es'

export interface SelectRecipientsUIProps<T extends Group | Profile = Group | Profile>
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {
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
export function SelectRecipientsUI<T extends Group | Profile = Group | Profile>(props: SelectRecipientsUIProps) {
    const classes = useStyles()
    const { items, maxSelection, selected, onSetSelected } = props
    const groupItems = items.filter(x => isGroup(x)) as Group[]
    const profileItems = items.filter(x => isProfile(x)) as Profile[]

    const selectedAsProfiles = selected.filter(x => isProfile(x)) as Profile[]
    const selectedAsGroups = selected.filter(x => isGroup(x)) as Group[]

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedIdentifiers, setSelectedIdentifiers] = useState<string[]>(
        Array.from(
            new Set(selected.flatMap(x => (isGroup(x) ? x.members.map(y => y.toText()) : x.identifier.toText()))),
        ),
    )

    useEffect(() => {
        if (selected.length === 0) {
            setSelectedIdentifiers([])
        }
    }, [selected])
    useEffect(() => {
        const selectedIdentifiersSet = new Set(selectedIdentifiers)
        const selectedProfiles = selected.filter(x => isProfile(x) && selectedIdentifiersSet.has(x.identifier.toText()))
        const selectedGroups: Group[] = groupItems.filter(x => {
            const groupIdentifiers = x.members.map(y => y.toText())
            return (
                groupIdentifiers.length > 0 &&
                selectedIdentifiers.length > 0 &&
                groupIdentifiers.length <= selectedIdentifiers.length &&
                difference(groupIdentifiers, selectedIdentifiers).length === 0
            )
        })
        const next = [...selectedGroups, ...selectedProfiles]

        if (
            (next.length === 0 && selected.length !== 0) ||
            (next.length > 0 && difference(next as T[], selected).length !== 0)
        ) {
            onSetSelected(next)
        }
    }, [groupItems, onSetSelected, selected, selectedIdentifiers])
    return (
        <div className={classes.root}>
            <Box className={classes.selectArea} display="flex">
                {groupItems.map(item => (
                    <GroupInChip
                        key={item.identifier.toText()}
                        item={item}
                        checked={selectedAsGroups.some(x => x.identifier.equals(item.identifier))}
                        disabled={item.members.length === 0}
                        onChange={(_, checked) => {
                            const identifiers = item.members.map(x => x.toText())
                            if (checked) {
                                setSelectedIdentifiers(Array.from(new Set([...selectedIdentifiers, ...identifiers])))
                            } else {
                                setSelectedIdentifiers(difference(selectedIdentifiers, identifiers))
                            }
                            setSearch('')
                        }}
                        {...props.GroupInChipProps}
                    />
                ))}
                <ClickableChip
                    ChipProps={{
                        label: geti18nString(
                            'post_dialog__select_specific_friends_title',
                            String(selectedIdentifiers.length),
                        ),
                        avatar: <AddIcon />,
                        disabled: profileItems.length === 0,
                        onClick() {
                            setOpen(true)
                        },
                    }}
                />
                <SelectRecipientsDialogUI
                    ignoreMyself
                    open={open}
                    items={profileItems}
                    selected={profileItems.filter(x => selectedIdentifiers.indexOf(x.identifier.toText()) > -1)}
                    disabled={false}
                    submitDisabled={false}
                    onSubmit={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                    onSelect={item => setSelectedIdentifiers([...selectedIdentifiers, item.identifier.toText()])}
                    onDeselect={item =>
                        setSelectedIdentifiers(selectedIdentifiers.filter(x => x !== item.identifier.toText()))
                    }
                    {...props.SelectRecipientsDialogUIProps}
                />
            </Box>
        </div>
    )
}

SelectRecipientsUI.defaultProps = {
    frozenSelected: [],
}

export function isProfile(x: Profile | Group): x is Profile {
    return x.identifier instanceof ProfileIdentifier
}
export function isGroup(x: Profile | Group): x is Group {
    return x.identifier instanceof GroupIdentifier
}
