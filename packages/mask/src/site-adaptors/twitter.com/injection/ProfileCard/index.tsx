import { CrossIsolationMessages, ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { AnchorProvider } from '@masknet/shared-base-ui'
import { LoadingBase, ShadowRootPopper, makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { Fade } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSocialIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ProfileCard } from '../../../../components/InjectedComponents/ProfileCard/index.js'
import { attachReactTreeWithoutContainer } from '../../../../utils/index.js'
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
    loading: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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

    const { data: identity, isLoading } = useQuery({
        queryKey: ['twitter', 'profile', twitterId],
        queryFn: () => Twitter.getUserByScreenName(twitterId),
        select: (user) => {
            if (!user) return null
            return {
                identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, user.screenName).unwrapOr(undefined),
                nickname: user.nickname,
                avatar: user.avatarURL,
                bio: user.bio,
                homepage: user.homepage,
            } as SocialIdentity
        },
    })

    const { data: resolvedIdentity, isLoading: resolving } = useSocialIdentity(identity)

    return (
        <Fade in={active} easing="linear" timeout={250}>
            <ShadowRootPopper
                open={!!anchorEl}
                anchorEl={anchorEl}
                keepMounted
                placement={placement}
                className={classes.root}
                ref={holderRef}
                onClick={stopPropagation}>
                {isLoading || resolving ? (
                    <div className={classes.loading}>
                        <LoadingBase size={36} />
                    </div>
                ) : resolvedIdentity ? (
                    <AnchorProvider anchorEl={anchorEl} anchorBounding={badgeBounding}>
                        <ProfileCard identity={resolvedIdentity} currentAddress={address} />
                    </AnchorProvider>
                ) : null}
            </ShadowRootPopper>
        </Fade>
    )
}

function stopPropagation(event: React.MouseEvent) {
    event.stopPropagation()
}
