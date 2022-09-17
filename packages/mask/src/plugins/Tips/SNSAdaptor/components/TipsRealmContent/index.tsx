import { Plugin } from '@masknet/plugin-infra'
import { TipButton } from '../../../components/index.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles<{}, 'postTipsButton'>()((theme, _, refs) => ({
    focusingPostButtonWrapper: {
        height: 46,
    },
    postButtonWrapper: {
        display: 'flex',
        alignItems: 'center',
        color: '#8899a6',
        position: 'relative',
        [`& .${refs.postTipsButton}::before`]: {
            content: '""',
            width: 34,
            height: 34,
            position: 'absolute',
            borderRadius: '100%',
            zIndex: 0,
        },
        [`&:hover .${refs.postTipsButton}::before`]: {
            backgroundColor: 'rgba(20,155,240,0.1)',
        },
    },
    postTipsButton: {},
    followTipsButton: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        borderRadius: '100%',
    },
    profileTipsButton: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        borderRadius: '100%',
    },
}))

export const TipsRealmContent: Plugin.InjectUI<Plugin.SNSAdaptor.TipsRealmOptions> = ({ identity, slot }) => {
    const { classes, cx } = useStyles({})
    if (!identity) return null

    const buttonClassMap: Record<Plugin.SNSAdaptor.TipsSlot, string> = {
        [Plugin.SNSAdaptor.TipsSlot.FollowButton]: classes.followTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.FocusingPost]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Post]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Profile]: classes.profileTipsButton,
    }
    if (slot === Plugin.SNSAdaptor.TipsSlot.Post || slot === Plugin.SNSAdaptor.TipsSlot.FocusingPost) {
        return (
            <div
                className={cx(
                    classes.postButtonWrapper,
                    slot === Plugin.SNSAdaptor.TipsSlot.FocusingPost ? classes.focusingPostButtonWrapper : undefined,
                )}>
                <TipButton className={buttonClassMap[slot]} receiver={identity} />
            </div>
        )
    }
    return <TipButton className={buttonClassMap[slot]} receiver={identity} />
}
