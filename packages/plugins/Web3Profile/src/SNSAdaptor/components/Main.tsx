import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { accountType } from '../types'
interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (str: string, accountId: string) => void
    currentVisitingProfile?: IdentityResolved
    footprintNumList?: number[]
    donationNumList?: number[]
    accountList?: accountType[]
}
export function Main(props: MainProps) {
    const { persona, openImageSetting, currentVisitingProfile, footprintNumList, donationNumList, accountList } = props
    return (
        <div>
            {accountList?.map((account, index) => (
                <PlatformCard
                    openImageSetting={(str: string) => {
                        openImageSetting(str, account?.identity)
                    }}
                    key={account?.identity}
                    account={account}
                    footprintNum={footprintNumList?.[index]}
                    donationNum={donationNumList?.[index]}
                    isCurrent={account?.identity === currentVisitingProfile?.identifier?.userId}
                />
            ))}
        </div>
    )
}
