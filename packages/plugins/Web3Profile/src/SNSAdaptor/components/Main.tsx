import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'

interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (str: string) => void
    currentVisitingProfile?: IdentityResolved
    footprintNumList?: number[]
    donationNumList?: number[]
}
export function Main(props: MainProps) {
    const { persona, openImageSetting, currentVisitingProfile, footprintNumList, donationNumList } = props
    return (
        <div>
            {persona?.linkedProfiles?.map((identifier, index) => (
                <PlatformCard
                    openImageSetting={(str: string) => {
                        openImageSetting(str)
                    }}
                    key={identifier?.identifier?.userId}
                    nickName={identifier?.nickname}
                    platformId={identifier?.identifier?.userId}
                    avatar={identifier?.avatar}
                    isCurrent={identifier?.identifier?.userId === currentVisitingProfile?.identifier?.userId}
                    footprintNum={footprintNumList?.[index]}
                    donationNum={donationNumList?.[index]}
                />
            ))}
        </div>
    )
}
