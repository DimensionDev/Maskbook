import type { SecurityAPI } from '@masknet/web3-providers'
import type { ReactNode } from 'react'
import { InfoIcon, RiskIcon, SuccessIcon } from '@masknet/icons'

export type TokenSecurity = SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & { contract: string }
export type SecurityMessageType = 'high' | 'medium' | 'safe'

export const IconMapping: { [key in SecurityMessageType]: ReactNode } = {
    high: <RiskIcon />,
    medium: <InfoIcon />,
    safe: <SuccessIcon />,
}
