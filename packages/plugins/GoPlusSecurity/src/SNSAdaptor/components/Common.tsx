import type { SecurityAPI } from '@masknet/web3-providers'
import { InfoIcon, RiskIcon, SuccessIcon } from '@masknet/icons'

export type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string }
export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export const IconMapping = {
    [SecurityMessageLevel.High]: <RiskIcon />,
    [SecurityMessageLevel.Medium]: <InfoIcon />,
    [SecurityMessageLevel.Safe]: <SuccessIcon />,
}
