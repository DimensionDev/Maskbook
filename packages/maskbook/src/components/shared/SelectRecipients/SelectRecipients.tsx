import { makeStyles, Box, Chip } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { useMemo, useState } from 'react'
import { difference } from 'lodash-es'
import { useI18N } from '../../../utils'
import type { ProfileOrGroupInListProps } from '../SelectPeopleAndGroups'
import { GroupInChipProps, GroupInChip } from './GroupInChip'
import { ProfileIdentifier, GroupIdentifier } from '../../../database/type'
import type { Group, Profile } from '../../../database'
import { SelectRecipientsDialogUIProps, SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { useStylesExtends } from '../../custom-ui-helper'

const useStyles = makeStyles({
    root: {
        display: 'inline-flex',
        flexWrap: 'wrap',
    },
})

export interface SelectRecipientsUIProps<T extends Group | Profile = Group | Profile> extends withClasses<never> {
    items: T[]
    selected: T[]
    frozenSelected: T[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    showAtNetwork?: boolean
    onSetSelected(selected: T[]): void
    GroupInChipProps?: Partial<GroupInChipProps>
    PersonOrGroupInListProps?: Partial<ProfileOrGroupInListProps>
    SelectRecipientsDialogUIProps?: Partial<SelectRecipientsDialogUIProps>
    children?: React.ReactNode
}

export function SelectRecipientsUI<T extends Group | Profile = Group | Profile>(props: SelectRecipientsUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { items, selected, onSetSelected, children } = props
    const currentIdentity = useCurrentIdentity()
    const groupItems = items.filter((x) => isGroup(x)) as Group[]
    const profileItems = items.filter(
        (x) => isProfile(x) && !x.identifier.equals(currentIdentity?.identifier) && x.linkedPersona?.fingerprint,
    ) as Profile[]
    const [open, setOpen] = useState(false)
    const selectedProfiles = selected.filter((x) => isProfile(x)) as Profile[]
    const selectedGroups = selected.filter((x) => isGroup(x)) as Group[]
    const selectedGroupMembers = useMemo(
        () => selectedGroups.flatMap((group) => group.members).map((identifier) => identifier.toText()),
        [selectedGroups],
    )

    return (
        <Box className={classes.root}>
            {groupItems.map((item) => (
                <GroupInChip
                    key={item.identifier.toText()}
                    item={item}
                    checked={selectedGroups.some((x) => x.identifier.equals(item.identifier))}
                    disabled={props.disabled}
                    onChange={(_, checked) => {
                        if (checked) onSetSelected([...selected, item])
                        else onSetSelected(difference(selected, [item]))
                    }}
                    {...props.GroupInChipProps}
                />
            ))}
            {children}
            <Chip
                label={t('post_dialog__select_specific_friends_title', {
                    selected: new Set([...selectedGroupMembers, ...selectedProfiles.map((x) => x.identifier.toText())])
                        .size,
                })}
                avatar={<AddIcon />}
                disabled={props.disabled || profileItems.length === 0}
                onClick={() => setOpen(true)}
            />
            <SelectRecipientsDialogUI
                open={open}
                items={profileItems}
                selected={profileItems.filter((x) => selected.includes(x))}
                disabledItems={profileItems.filter((x) => selectedGroupMembers.includes(x.identifier.toText()))}
                disabled={false}
                submitDisabled={false}
                onSubmit={() => setOpen(false)}
                onClose={() => setOpen(false)}
                onSelect={(item) => onSetSelected([...selected, item])}
                onDeselect={(item) => onSetSelected(difference(selected, [item]))}
                {...props.SelectRecipientsDialogUIProps}
            />
        </Box>
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
