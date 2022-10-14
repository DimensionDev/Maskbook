import { makeStyles } from '@masknet/theme'
import { Stack } from '@mui/material'
import { Plugin } from '@masknet/plugin-infra'
import { TipButton } from '../../../components/index.js'
import Guide from '../../../components/Guide.js'

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
    mirrorEntryTipsButtonWrapper: {
        justifyContent: 'flex-end',
    },
    postTipsButton: {},
    roundButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.maskColor.borderSecondary,
        verticalAlign: 'top',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,243,244,0.1)' : 'rgba(15,20,25,0.1)',
        },
    },
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

export const TipsRealmContent: Plugin.InjectUI<Plugin.SNSAdaptor.TipsRealmOptions> = ({
    identity,
    slot,
    onStatusUpdate,
}) => {
    const { classes, cx } = useStyles({})
    if (!identity) return null

    const buttonClassMap: Record<Plugin.SNSAdaptor.TipsSlot, string> = {
        [Plugin.SNSAdaptor.TipsSlot.FollowButton]: cx(classes.followTipsButton, classes.roundButton),
        [Plugin.SNSAdaptor.TipsSlot.FocusingPost]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Post]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Profile]: cx(classes.profileTipsButton, classes.roundButton),
        [Plugin.SNSAdaptor.TipsSlot.MirrorMenu]: classes.profileTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.MirrorEntry]: classes.postTipsButton,
    }

    const button = <TipButton className={buttonClassMap[slot]} receiver={identity} onStatusUpdate={onStatusUpdate} />

    if (slot === Plugin.SNSAdaptor.TipsSlot.MirrorMenu) {
        return (
            <Guide>
                <Stack display="inline-block" width="38px" height="38px" position="relative" top={2}>
                    {button}
                </Stack>
            </Guide>
        )
    }

    if (
        slot === Plugin.SNSAdaptor.TipsSlot.Post ||
        slot === Plugin.SNSAdaptor.TipsSlot.FocusingPost ||
        slot === Plugin.SNSAdaptor.TipsSlot.MirrorEntry
    ) {
        return (
            <div
                className={cx(
                    classes.postButtonWrapper,
                    slot === Plugin.SNSAdaptor.TipsSlot.FocusingPost ? classes.focusingPostButtonWrapper : undefined,
                    slot === Plugin.SNSAdaptor.TipsSlot.MirrorEntry ? classes.mirrorEntryTipsButtonWrapper : undefined,
                )}>
                {button}
            </div>
        )
    }

    return button
}
