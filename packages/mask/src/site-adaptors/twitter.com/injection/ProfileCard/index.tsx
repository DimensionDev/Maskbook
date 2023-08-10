import { useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages, ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { LoadingBase, ShadowRootPopper, makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { useSocialIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ProfileCard } from '../../../../components/InjectedComponents/ProfileCard/index.js'
import { attachReactTreeWithoutContainer } from '../../../../utils/index.js'
import { twitterBase } from '../../base.js'
import { CARD_HEIGHT, CARD_WIDTH } from './constants.js'
import { useControlProfileCard } from './useControlProfileCard.js'
import { Fade } from '@mui/material'
import { AnchorProvider, queryClient } from '@masknet/shared-base-ui'

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

    const { value: identity, loading } = useAsync(async (): Promise<SocialIdentity | null> => {
        if (!twitterId) return null

        const user = await queryClient.fetchQuery({
            queryKey: ['twitter', 'profile', twitterId],
            queryFn: () => Twitter.getUserByScreenName(twitterId),
        })
        if (!user?.legacy) return null

        const handle = user.legacy.screen_name

        return {
            identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
            nickname: user.legacy.name,
            avatar: user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
            bio: user.legacy.description,
            homepage: user.legacy.entities.url?.urls[0]?.expanded_url ?? '',
        }
    }, [twitterId])

    const { value: resolvedIdentity, loading: resolving } = useSocialIdentity(identity)

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
                {loading || resolving ? (
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
