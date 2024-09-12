import { CrossIsolationMessages, ProfileIdentifier, stopPropagation, type SocialIdentity } from '@masknet/shared-base'
import { AnchorProvider } from '@masknet/shared-base-ui'
import { ShadowRootPopper, makeStyles } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import { Fade } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSocialIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ProfileCard } from '../../../../components/InjectedComponents/ProfileCard/index.js'
import { attachReactTreeWithoutContainer } from '../../../../utils/shadow-root.js'
import { twitterBase } from '../../base.js'
import { CARD_HEIGHT, CARD_WIDTH } from './constants.js'
import { useControlProfileCard } from './useControlProfileCard.js'

export function injectProfileCardHolder(signal: AbortSignal) {
    attachReactTreeWithoutContainer('profile-card', <ProfileCardHolder />, signal)
}

const useStyles = makeStyles()({
    root: {
        borderRadius: 10,
        width: CARD_WIDTH,
        maxWidth: CARD_WIDTH,
        height: CARD_HEIGHT,
        maxHeight: CARD_HEIGHT,
    },
})

function ProfileCardHolder() {
    const { classes } = useStyles()
    const holderRef = useRef<HTMLDivElement>(null)
    const [twitterId, setTwitterId] = useState('')
    const [badgeBounding, setBadgeBounding] = useState<DOMRect>()
    const { active, placement } = useControlProfileCard(holderRef)
    const [address, setAddress] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) return
            setAddress(event.address ?? '')
            setTwitterId(event.userId)
            setBadgeBounding(event.anchorBounding)
            setAnchorEl(event.anchorEl)
        })
    }, [])

    const { data: identity } = useQuery({
        queryKey: ['twitter', 'profile', twitterId],
        staleTime: 3600_000,
        refetchOnWindowFocus: false,
        queryFn: () => FireflyTwitter.getUserInfo(twitterId),
        select: (user) => {
            if (!user) return null
            const legacy = user.legacy
            return {
                identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, legacy.screen_name).unwrapOr(undefined),
                nickname: legacy.name,
                avatar: legacy.profile_image_url_https,
                bio: legacy.description,
                homepage: legacy.entities.url?.urls?.[0]?.expanded_url,
            } as SocialIdentity
        },
    })

    const { data: resolvedIdentity } = useSocialIdentity(identity)

    const popperOptions = useMemo(() => {
        return {
            modifiers: [
                {
                    name: 'detect-glitch',
                    enabled: true,
                    phase: 'beforeRead',
                    fn: (options: any) => {
                        const reference = options.state.rects?.reference
                        if (!reference) return
                        if (!reference.height && !reference.width) {
                            setAnchorEl(null)
                        }
                    },
                },
            ],
        }
    }, [])

    return (
        <Fade in={active} easing="linear" timeout={250}>
            <ShadowRootPopper
                open={!!anchorEl}
                anchorEl={anchorEl}
                keepMounted
                placement={placement}
                className={classes.root}
                popperOptions={popperOptions}
                ref={holderRef}
                onClick={stopPropagation}>
                <AnchorProvider anchorEl={anchorEl} anchorBounding={badgeBounding}>
                    <ProfileCard key={twitterId} identity={resolvedIdentity || undefined} currentAddress={address} />
                </AnchorProvider>
            </ShadowRootPopper>
        </Fade>
    )
}
