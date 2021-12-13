import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import type { BannerProps } from '../../Welcomes/Banner'
import { DecryptFailedReason } from '../../../utils/constants'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import MaskPluginWrapper from '../../../plugins/MaskPluginWrapper'
import { useMyPersonas } from '../../DataSource/useMyPersonas'
import { Button } from '@mui/material'
import { Services } from '../../../extension/service'
import stringify from 'json-stable-stringify'
import { DashboardRoutes } from '@masknet/shared-base'
import { currentSetupGuideStatus } from '../../../settings/settings'
import { activatedSocialNetworkUI } from '../../../social-network'
import { SetupGuideStep } from '../SetupGuide'
import { makeStyles, MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles()(() => {
    return {
        button: {
            color: MaskColorVar.twitterButtonText,
            '&,&:hover': {
                background: MaskColorVar.twitterButton,
            },
        },
    }
})

export interface DecryptPostFailedProps {
    error: Error
    AdditionalContentProps?: Partial<AdditionalContentProps>
    NotSetupYetPromptProps?: Partial<BannerProps>
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}
export const DecryptPostFailed = memo(function DecryptPostFailed(props: DecryptPostFailedProps) {
    const { AdditionalContentProps, author, postedBy, error } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const personas = useMyPersonas()
    const onClick = async () => {
        if (!personas.length) {
            Services.Welcome.openOptionsPage(DashboardRoutes.Setup)
        } else {
            const currentPersona = await Services.Settings.getCurrentPersonaIdentifier()
            currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
                status: SetupGuideStep.FindUsername,
                persona: currentPersona?.toText(),
            })
        }
    }
    if (error?.message === DecryptFailedReason.MyCryptoKeyNotFound) {
        const name = personas.length ? t('please_connect_persona') : t('please_create_persona')
        const button = personas.length ? t('connect_persona') : t('create_persona')
        return (
            <MaskPluginWrapper
                pluginName={name}
                action={
                    <Button variant="contained" className={classes.button} onClick={onClick}>
                        {button}
                    </Button>
                }
            />
        )
    }
    return (
        <AdditionalContent
            title={t('service_decryption_failed')}
            titleIcon="error"
            message={error?.message}
            headerActions={wrapAuthorDifferentMessage(author, postedBy, void 0)}
            {...AdditionalContentProps}
        />
    )
})
