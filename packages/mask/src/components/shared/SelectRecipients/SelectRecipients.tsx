import { Box, Chip } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@mui/icons-material/Add'
import { useEffect, useState } from 'react'
import { difference } from 'lodash-unified'
import { useI18N } from '../../../utils'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()({
    root: {
        display: 'inline-flex',
        flexWrap: 'wrap',
    },
})

export interface SelectRecipientsUIProps {
    items: LazyRecipients
    selected: Profile[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    onSetSelected(selected: Profile[]): void
}

export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { items, selected, onSetSelected } = props
    const currentIdentity = useCurrentIdentity()
    const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)
    const [open, setOpen] = useState(false)

    useEffect(() => void (open && items.request()), [open, items.request])

    return (
        <Box className={classes.root}>
            <Chip
                label={t('post_dialog__select_specific_e2e_target_title', {
                    selected: new Set(selected.map((x) => x.identifier)).size,
                })}
                avatar={<AddIcon />}
                disabled={props.disabled || profileItems?.length === 0}
                onClick={() => setOpen(true)}
            />
            <SelectRecipientsDialogUI
                open={open}
                items={profileItems || EMPTY_LIST}
                selected={profileItems?.filter((x) => selected.includes(x)) || EMPTY_LIST}
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
