import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { AccountType } from '../types'
import type { CURRENT_STATUS } from '../../constants'
interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (status: CURRENT_STATUS, accountId: string) => void
    currentVisitingProfile?: IdentityResolved
    accountList?: AccountType[]
}
export function Main(props: MainProps) {
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
            ))}
        </div>
    )
}
