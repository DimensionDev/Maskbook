import { Icon } from '@masknet/icons'
import type { SecurityAPI } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Stack } from '@mui/material'
import { memo, ReactNode } from 'react'
import type { useI18N } from '../../locales'

export type TokenSecurity = SecurityAPI.ContractSecurity &
    SecurityAPI.TokenSecurity &
    SecurityAPI.TradingSecurity & { contract: string; chainId: ChainId }

export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export const Center: FC = memo(({ children }) => (
    <Stack height="100%" justifyContent="center" alignItems="center">
        {children}
    </Stack>
))

type DefineMapping = {
    [key in SecurityMessageLevel]: {
        i18nKey: keyof ReturnType<typeof useI18N>
        bgColor: string
        titleColor: string
        icon(size?: number): ReactNode
    }
}

export const DefineMapping: DefineMapping = {
    [SecurityMessageLevel.High]: {
        i18nKey: 'high_risk',
        titleColor: '#FF5F5F',
        bgColor: 'rgba(255, 53, 69, 0.1)',
        icon: (size: number) => <Icon type="securityRisk" size={size ?? 24} />,
    },
    [SecurityMessageLevel.Medium]: {
        i18nKey: 'medium_risk',
        titleColor: '#FFB100',
        bgColor: 'rgba(255, 177, 0, 0.1)',
        // TODO: Merge duplicate icon in a another PR.
        icon: (size: number) => <Icon type="securityWarning" size={size ?? 24} color="#FFB915" />,
    },
    [SecurityMessageLevel.Safe]: {
        i18nKey: 'low_risk',
        titleColor: '#60DFAB',
        bgColor: 'rgba(119, 224, 181, 0.1)',
        icon: (size: number) => <Icon type="success" />,
    },
}
