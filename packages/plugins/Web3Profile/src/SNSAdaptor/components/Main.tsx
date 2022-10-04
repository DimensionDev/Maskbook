import { PlatformCard } from './PlatformCard.js'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { AccountType } from '../types.js'
import type { CURRENT_STATUS } from '../../constants.js'
import { Empty } from './Empty.js'
import { Box } from '@mui/material'
import { useI18N } from '../../locales/index.js'

export interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (status: CURRENT_STATUS, accountId: string) => void
    currentVisitingProfile?: IdentityResolved
    accountList?: AccountType[]
}
export function Main(props: MainProps) {
    const { openImageSetting, currentVisitingProfile, accountList } = props
    const t = useI18N()
    if (!accountList?.length) {
        return (
            <Box justifyContent="center" alignItems="center" height="100%">
                <Empty content={t.account_empty()} />
            </Box>
        )
    }
    return (
        <div>
            {accountList.map((account) => (
                <PlatformCard
                    key={account.identity}
                    openImageSetting={(status: CURRENT_STATUS) => {
                        openImageSetting(status, account.identity)
                    }}
                    account={account}
                    currentPersona={currentVisitingProfile}
                    isCurrent={account.identity === currentVisitingProfile?.identifier?.userId?.toLowerCase()}
                />
            ))}
        </div>
    )
}
