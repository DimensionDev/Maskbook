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
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { useStylesExtends } from '../../custom-ui-helper'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../shared-settings/settings'

const useStyles = makeStyles({
    selectArea: {
        display: 'flex',
        flexWrap: 'wrap',
    },
})

export interface SelectRecipientsUIProps<T extends Group | Profile = Group | Profile>
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {
    items: T[]
    selected: T[]
    frozenSelected: T[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    showAtNetwork?: boolean
    onSetSelected(selected: T[]): void
    GroupInChipProps?: Partial<GroupInChipProps>
    PersonOrGroupInListProps?: Partial<PersonOrGroupInListProps>
    SelectRecipientsDialogUIProps?: Partial<SelectRecipientsDialogUIProps>
}

export function SelectRecipientsUI<T extends Group | Profile = Group | Profile>(props: SelectRecipientsUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { items, selected, onSetSelected } = props
    const isDebugging = useValueRef(debugModeSetting)
    const currentIdentity = useCurrentIdentity()
    const currentIdentifier = currentIdentity ? currentIdentity.identifier.toText() : ''
    const groupItems = items.filter(x => isGroup(x)) as Group[]
    const profileItems = items.filter(
        x => isProfile(x) && !x.identifier.equals(currentIdentity?.identifier) && x.linkedPersona?.fingerprint,
    ) as Profile[]
    const [open, setOpen] = useState(false)
    const selectedAsGroups = selected.filter(x => isGroup(x)) as Group[]
    const [selectedIdentifiers, setSelectedIdentifiers] = useState<string[]>(
        difference(
            Array.from(
                new Set(selected.flatMap(x => (isGroup(x) ? x.members.map(y => y.toText()) : x.identifier.toText()))),
            ),
            [currentIdentifier],
        ),
    )

    // clear selected identifiers
    useEffect(() => {
        if (selected.length === 0) {
            setSelectedIdentifiers([])
        }
    }, [selected])

    // prevent from selecting current identity as recipient
    useEffect(() => {
        const next = difference(selectedIdentifiers, [currentIdentifier])
        if (difference(selectedIdentifiers, next).length) {
            setSelectedIdentifiers(next)
        }
    }, [currentIdentifier, selectedIdentifiers])
    useEffect(() => {
        const selectedIdentifiersSet = new Set(selectedIdentifiers)
        const selectedProfiles = profileItems.filter(x => selectedIdentifiersSet.has(x.identifier.toText()))
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
        if (next.length === selected.length && (next.length === 0 || difference(next, selected).length === 0)) {
            return
        }
        onSetSelected(next)
    }, [groupItems, onSetSelected, profileItems, selected, selectedIdentifiers])
    return (
        <div className={classes.root}>
            <Box className={classes.selectArea} display="flex">
                {groupItems.map(item => (
                    <GroupInChip
                        key={item.identifier.toText()}
                        item={item}
                        checked={selectedAsGroups.some(x => x.identifier.equals(item.identifier))}
                        disabled={props.disabled || item.members.length === 0}
                        onChange={(_, checked) => {
                            const identifiers = item.members.map(x => x.toText())
                            if (checked) {
                                setSelectedIdentifiers(Array.from(new Set([...selectedIdentifiers, ...identifiers])))
                            } else {
                                setSelectedIdentifiers(difference(selectedIdentifiers, identifiers))
                            }
                        }}
                        {...props.GroupInChipProps}
                    />
                ))}
                {isDebugging ? (
                    <ClickableChip
                        ChipProps={{
                            label: geti18nString(
                                'post_dialog__select_specific_friends_title',
                                String(selectedIdentifiers.length),
                            ),
                            avatar: <AddIcon />,
                            disabled: props.disabled || profileItems.length === 0,
                            onClick() {
                                setOpen(true)
                            },
                        }}
                    />
                ) : null}

                <SelectRecipientsDialogUI
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
