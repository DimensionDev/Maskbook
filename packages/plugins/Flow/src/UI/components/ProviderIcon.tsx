import { ProviderType, resolveProviderName } from '@masknet/web3-shared-flow'
import { Typography } from '@mui/material'

export interface ProviderIconProps {
    size: number
    providerType: ProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    return <Typography>{resolveProviderName(props.providerType)}</Typography>
}
