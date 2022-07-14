import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { AccountType } from '../types'
import type { CURRENT_STATUS } from '../../constants'
import { Empty } from './Empty'
import { Box } from '@mui/material'
import { useI18N } from '../../locales'
interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (status: CURRENT_STATUS, accountId: string) => void
    currentVisitingProfile?: IdentityResolved
    accountList?: AccountType[]
}
export function Main(props: MainProps) {
    const t = useI18N()
    const { openImageSetting, currentVisitingProfile, accountList } = props
    return (
        <div>
            {accountList?.map((account, index) => (
                <PlatformCard
                    openImageSetting={(status: CURRENT_STATUS) => {
                        openImageSetting(status, account?.identity)
                    }}
                    key={account?.identity}
                    account={account}
                    currentPersona={currentVisitingProfile}
                    isCurrent={account?.identity === currentVisitingProfile?.identifier?.userId?.toLowerCase()}
                />
            )) ?? (
                <Box marginTop="calc(45% - 47px)">
                    <Empty content={t.account_empty()} />
                </Box>
            )}
        </div>
    )
}
