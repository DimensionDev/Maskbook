import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { accountType } from '../types'
interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (str: string, accountId: string) => void
    currentVisitingProfile?: IdentityResolved
    accountList?: accountType[]
}
export function Main(props: MainProps) {
    const { openImageSetting, currentVisitingProfile, accountList } = props
    return (
        <div>
            {accountList?.map((account, index) => (
                <PlatformCard
                    openImageSetting={(str: string) => {
                        openImageSetting(str, account?.identity)
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
