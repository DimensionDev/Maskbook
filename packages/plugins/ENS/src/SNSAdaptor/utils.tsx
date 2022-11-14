import { createLookupTableResolver, NextIDPlatform } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import type { ReactNode } from 'react'

export const resolveNextIDPlatformIcon = createLookupTableResolver<NextIDPlatform, ReactNode>(
    {
        [NextIDPlatform.Ethereum]: <></>,
        [NextIDPlatform.NextID]: <></>,
        [NextIDPlatform.GitHub]: <Icons.GitHub width={20} height={20} />,
        [NextIDPlatform.Keybase]: <Icons.Keybase width={20} height={20} />,
        [NextIDPlatform.Twitter]: <Icons.TwitterRoundBlackWhite width={20} height={20} />,
        [NextIDPlatform.ENS]: <></>,
        [NextIDPlatform.RSS3]: <></>,
        [NextIDPlatform.LENS]: <Icons.LensBlackWhite width={20} height={20} />,
        [NextIDPlatform.REDDIT]: <Icons.RedditRoundBlackWhite width={20} height={20} />,
        [NextIDPlatform.SYBIL]: <></>,
    },
    () => {
        return <></>
    },
)
