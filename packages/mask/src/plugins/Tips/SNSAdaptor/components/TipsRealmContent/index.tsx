import { Plugin } from '@masknet/plugin-infra'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { PluginGuide, PluginGuideProvider } from '@masknet/shared'
import { EnhanceableSite, PluginID } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { Stack } from '@mui/material'
import type { FC } from 'react'
import { activatedSocialNetworkUI } from '../../../../../social-network/ui.js'
import { TipButton } from '../../../components/index.js'
import { useI18N } from '../../../locales/index.js'
import { useTipsUserGuide } from '../../../storage/index.js'

const useStyles = makeStyles<{ buttonSize: number }, 'postTipsButton'>()((theme, { buttonSize }, refs) => ({
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
        width: buttonSize,
        height: buttonSize,
        borderRadius: '100%',
    },
}))

const { TipsSlot } = Plugin.SNSAdaptor
export const TipsRealmContent: FC<Plugin.SNSAdaptor.TipsRealmOptions> = ({
    identity,
    slot,
    accounts,
    iconSize = 24,
    buttonSize = 34,
    onStatusUpdate,
}) => {
    const t = useI18N()
    const { classes, cx } = useStyles({ buttonSize })
    const lastStep = useTipsUserGuide(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite)
    const myIdentity = useLastRecognizedIdentity()

    if (!identity || identity.userId === myIdentity?.identifier?.userId) return null

    const buttonClassMap: Record<Plugin.SNSAdaptor.TipsSlot, string> = {
        [TipsSlot.FollowButton]: cx(classes.followTipsButton, classes.roundButton),
        [TipsSlot.FocusingPost]: classes.postTipsButton,
        [TipsSlot.Post]: classes.postTipsButton,
        [TipsSlot.Profile]: cx(classes.profileTipsButton, classes.roundButton),
        [TipsSlot.MirrorMenu]: classes.profileTipsButton,
        [TipsSlot.MirrorEntry]: classes.postTipsButton,
    }

    const button = (
        <TipButton
            accounts={accounts}
            className={buttonClassMap[slot]}
            iconSize={iconSize}
            receiver={identity}
            onStatusUpdate={onStatusUpdate}
        />
    )

    if (slot === TipsSlot.MirrorMenu) {
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
                    <Stack
                        display="flex"
                        width="38px"
                        height="38px"
                        position="relative"
                        top={0}
                        alignItems="center"
                        justifyContent="center">
                        {button}
                    </Stack>
                </PluginGuide>
            </PluginGuideProvider>
        )
    }

    if (slot === TipsSlot.Post || slot === TipsSlot.FocusingPost || slot === TipsSlot.MirrorEntry) {
        return (
            <div
                className={cx(
                    classes.postButtonWrapper,
                    slot === TipsSlot.FocusingPost ? classes.focusingPostButtonWrapper : undefined,
                    slot === TipsSlot.MirrorEntry ? classes.mirrorEntryTipsButtonWrapper : undefined,
                )}>
                {button}
            </div>
        )
    }

    return button
}
