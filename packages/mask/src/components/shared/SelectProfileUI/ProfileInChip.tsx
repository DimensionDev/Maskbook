import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import { Avatar } from '../../../utils/index.js'
import type { ProfileInformation as Profile } from '@masknet/web3-shared-base'

export interface ProfileInChipProps {
    onDelete?(): void
    disabled?: boolean
    item: Profile
    ChipProps?: ChipProps
}
export function ProfileInChip(props: ProfileInChipProps) {
    const { disabled, onDelete, item: profile } = props
    const avatar = profile.avatar ? <Avatar person={profile} /> : undefined
    const displayName = profile.nickname || profile.identifier.userId

    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={disabled ? undefined : onDelete}
            label={displayName}
            avatar={avatar}
            {...props.ChipProps}
        />
    )
}
