import { Plugin } from '@masknet/plugin-infra'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { PluginGuide } from '@masknet/shared'
import type { EnhanceableSite } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Stack } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../../../social-network/ui.js'
import { useTipsUserGuide } from '../../../storage/index.js'
import { TipButton } from '../../../components/index.js'
import { useI18N } from '../../../locales/index.js'

const useStyles = makeStyles<{ buttonSize: number }, 'postTipsButton'>()((theme, { buttonSize }, refs) => ({
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
        boxSizing: 'border-box',
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
export function TipsRealmContent({
    identity,
    slot,
    accounts,
    iconSize = 24,
    buttonSize = 34,
    onStatusUpdate,
}: Plugin.SNSAdaptor.TipsRealmOptions) {
    const t = useI18N()
    const { classes, cx } = useStyles({ buttonSize })
    const userGuide = useTipsUserGuide(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite)
    const myIdentity = useLastRecognizedIdentity()

    if (!identity || identity.userId === myIdentity?.identifier?.userId) return null

    const buttonClassMap: Record<Plugin.SNSAdaptor.TipsSlot, string> = {
        [TipsSlot.FollowButton]: cx(classes.followTipsButton, classes.roundButton),
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
        const { finished, step, nextStep } = userGuide
        return (
            <PluginGuide
                step={1}
                totalStep={1}
                finished={finished}
                currentStep={step}
                onNext={nextStep}
                title={t.tips_guide_description()}
                actionText={t.tips_guide_action()}>
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
        )
    }

    if (slot === TipsSlot.Post || slot === TipsSlot.MirrorEntry) {
        return (
            <div
                className={cx(
                    classes.postButtonWrapper,
                    slot === TipsSlot.MirrorEntry ? classes.mirrorEntryTipsButtonWrapper : undefined,
                )}>
                {button}
            </div>
        )
    }

    return button
}
