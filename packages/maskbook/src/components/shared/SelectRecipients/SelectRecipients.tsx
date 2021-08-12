import { Box, Chip } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@material-ui/icons/Add'
import { useState } from 'react'
import { difference } from 'lodash-es'
import { useI18N } from '../../../utils'
import type { Profile } from '../../../database'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'

const useStyles = makeStyles()({
    root: {
        display: 'inline-flex',
        flexWrap: 'wrap',
    },
})

export interface SelectRecipientsUIProps {
    items: Profile[]
    selected: Profile[]
    frozenSelected: Profile[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    onSetSelected(selected: Profile[]): void
    children?: React.ReactNode
}

export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { items, selected, onSetSelected, children } = props
    const currentIdentity = useCurrentIdentity()
    const profileItems = items.filter(
        (x) => !x.identifier.equals(currentIdentity?.identifier) && x.linkedPersona?.fingerprint,
    )
    const [open, setOpen] = useState(false)

    return (
        <Box className={classes.root}>
            {children}
            <Chip
                label={t('post_dialog__select_specific_friends_title', {
                    selected: new Set([...selected.map((x) => x.identifier.toText())]).size,
                })}
                avatar={<AddIcon />}
                disabled={props.disabled || profileItems.length === 0}
                onClick={() => setOpen(true)}
            />
            <SelectRecipientsDialogUI
                open={open}
                items={profileItems}
                selected={profileItems.filter((x) => selected.includes(x))}
                disabled={false}
                submitDisabled={false}
                onSubmit={() => setOpen(false)}
                onClose={() => setOpen(false)}
                onSelect={(item) => onSetSelected([...selected, item])}
                onDeselect={(item) => onSetSelected(difference(selected, [item]))}
            />
        </Box>
    )
}

SelectRecipientsUI.defaultProps = {
    frozenSelected: [],
}
