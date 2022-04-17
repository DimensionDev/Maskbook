import { PlatformCard } from './PlatformCard'
import type { PersonaInformation } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'

interface MainProps {
    persona?: PersonaInformation
    openImageSetting: (str: string) => void
    currentVisitingProfile?: IdentityResolved
}
export function Main(props: MainProps) {
    const { persona, openImageSetting, currentVisitingProfile } = props
    return (
        <div>
            {persona?.linkedProfiles?.map((identifier) => (
                <PlatformCard
                    openImageSetting={openImageSetting}
                    key={identifier?.identifier?.userId}
                    nickName={identifier?.nickname}
                    platformId={identifier?.identifier?.userId}
                    avatar={identifier?.avatar}
                    isCurrent={identifier?.identifier?.userId === currentVisitingProfile?.identifier?.userId}
                />
            ))}
        </div>
    )
}
