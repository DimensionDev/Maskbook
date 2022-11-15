import { makeStyles } from '@masknet/theme'
import { Stack } from '@mui/material'
import { Plugin } from '@masknet/plugin-infra'
import { TipButton } from '../../../components/index.js'
import { PluginGuide, PluginGuideProvider } from '@masknet/shared'
import { EnhanceableSite, PluginID } from '@masknet/shared-base'
import { useI18N } from '../../../locales/index.js'
import { useTipsUserGuide } from '../../../storage/index.js'
import { activatedSocialNetworkUI } from '../../../../../social-network/ui.js'

const useStyles = makeStyles<{ iconSize: number; buttonSize: number }, 'postTipsButton'>()(
    (theme, { iconSize, buttonSize }, refs) => ({
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
            width: buttonSize,
            height: buttonSize,
            left: 0,
            top: 0,
            borderRadius: '100%',
        },
        profileTipsButton: {
            position: 'absolute',
            width: buttonSize,
            height: buttonSize,
            left: 0,
            top: 0,
            borderRadius: '100%',
        },
        icon: {
            width: iconSize,
            height: iconSize,
        },
    }),
)

export const TipsRealmContent: Plugin.InjectUI<Plugin.SNSAdaptor.TipsRealmOptions> = ({
    identity,
    slot,
    accounts,
    iconSize = 24,
    buttonSize = 34,
    onStatusUpdate,
}) => {
    const t = useI18N()
    const { classes, cx } = useStyles({ iconSize, buttonSize })
    const lastStep = useTipsUserGuide(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite)

    if (!identity) return null

    const buttonClassMap: Record<Plugin.SNSAdaptor.TipsSlot, string> = {
        [Plugin.SNSAdaptor.TipsSlot.FollowButton]: cx(classes.followTipsButton, classes.roundButton),
        [Plugin.SNSAdaptor.TipsSlot.FocusingPost]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Post]: classes.postTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.Profile]: cx(classes.profileTipsButton, classes.roundButton),
        [Plugin.SNSAdaptor.TipsSlot.MirrorMenu]: classes.profileTipsButton,
        [Plugin.SNSAdaptor.TipsSlot.MirrorEntry]: classes.postTipsButton,
    }

    const button = (
        <TipButton
            accounts={accounts}
            className={buttonClassMap[slot]}
            classes={{ icon: classes.icon }}
            receiver={identity}
            onStatusUpdate={onStatusUpdate}
        />
    )

    if (slot === Plugin.SNSAdaptor.TipsSlot.MirrorMenu) {
        return (
            <PluginGuideProvider
                value={{
                    pluginID: PluginID.Tips,
                    storageKey: EnhanceableSite.Mirror,
                    // Work for migrate from old tips guide setting
                    totalStep: lastStep.finished ? 0 : 1,
                    guides: [
                        {
                            title: t.tips_guide_description(),
                            actionText: t.tips_guide_action(),
                        },
                    ],
                }}>
                <PluginGuide step={1}>
                    <Stack display="inline-block" width="38px" height="38px" position="relative" top={2}>
                        {button}
                    </Stack>
                </PluginGuide>
            </PluginGuideProvider>
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
