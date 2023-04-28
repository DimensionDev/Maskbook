import { useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages, ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { Fade } from '@mui/material'
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
        position: 'absolute',
        borderRadius: 10,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
    const [badgeBounding, setBadgeBounding] = useState<DOMRect | undefined>()
    const { active, style } = useControlProfileCard(holderRef)
    const [address, setAddress] = useState('')

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) return
            setAddress(event.address ?? '')
            setTwitterId(event.userId)
            setBadgeBounding(event.badgeBounding)
        })
    }, [])

    const { value: identity, loading } = useAsync(async (): Promise<SocialIdentity | null> => {
        if (!twitterId) return null

        const user = await Twitter.getUserByScreenName(twitterId)
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
            <div className={classes.root} style={style} ref={holderRef} onClick={stopPropagation}>
                {loading || resolving ? (
                    <div className={classes.loading}>
                        <LoadingBase size={36} />
                    </div>
                ) : resolvedIdentity ? (
                    <ProfileCard identity={resolvedIdentity} badgeBounding={badgeBounding} currentAddress={address} />
                ) : null}
            </div>
        </Fade>
    )
}

function stopPropagation(event: React.MouseEvent) {
    event.stopPropagation()
}
