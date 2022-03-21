import type { SecurityAPI } from '@masknet/web3-providers'
import { InfoIcon, RiskIcon, SuccessIcon } from '@masknet/icons'
import { memo } from 'react'
import { Stack } from '@mui/material'

export type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string }

export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export const Center = memo(({ children }) => (
    <Stack height="100%" justifyContent="center" alignItems="center">
        {children}
    </Stack>
))

export const IconMapping = {
    [SecurityMessageLevel.High]: <RiskIcon />,
    [SecurityMessageLevel.Medium]: <InfoIcon />,
    [SecurityMessageLevel.Safe]: <SuccessIcon />,
}
