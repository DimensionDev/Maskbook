import { makeStyles } from '@masknet/theme'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { NFTBadgeTimeline } from './NFTBadgeTimeline'

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

interface NFTBadgeTweetProps {
    avatarId: string
    width: number
    height: number
}

export function NFTBadgeTweet(props: NFTBadgeTweetProps) {
    const { avatarId, width, height } = props
    const identity = useCurrentIdentity()

    console.log(identity)
    if (!identity?.identifier.userId) return null
    return <NFTBadgeTimeline width={width} height={height} userId={identity?.identifier.userId} avatarId={avatarId} />
}
