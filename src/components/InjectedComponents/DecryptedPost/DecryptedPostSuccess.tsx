import React from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/styles'
import { Link, Typography, Theme } from '@material-ui/core'
import type { Profile } from '../../../database'
import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { useStylesExtends } from '../../custom-ui-helper'
import type { TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { PluginUI, PluginSuccessDecryptionComponentProps } from '../../../plugins/plugin'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
    data: { signatureVerifyResult: boolean; content: TypedMessage }
    postIdentifier?: PostIdentifier<ProfileIdentifier>
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

const useSuccessStyles = makeStyles(() => ({
    header: { display: 'flex', alignItems: 'center' },
    addRecipientsLink: { cursor: 'pointer' },
    signatureVerifyPassed: { color: green[500], display: 'flex' },
    signatureVerifyFailed: { color: red[500], display: 'flex' },
}))

export const DecryptPostSuccess = React.memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const { data, profiles, postIdentifier } = props
    const classes = useStylesExtends(useSuccessStyles(), props)
    const { t } = useI18N()
    const shareMenu = useShareMenu(
        profiles,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    const rightActions = props.requestAppendRecipients && !props.sharedPublic && (
        <Link color="primary" onClick={shareMenu.showShare} className={classes.addRecipientsLink}>
            {t('decrypted_postbox_add_recipients')}
        </Link>
    )
    const verify = data.signatureVerifyResult ? (
        <Typography variant="caption" className={classes.signatureVerifyPassed}>
            {t('decrypted_postbox_verified')}
            <CheckIcon fontSize="small" />
        </Typography>
    ) : (
        <Typography variant="caption" className={classes.signatureVerifyFailed}>
            {t('decrypted_postbox_not_verified')}
            <ClearIcon fontSize="small" />
        </Typography>
    )
    return (
        <>
            {shareMenu.ShareMenu}
            <AdditionalContent
                metadataRenderer={{
                    after: (props) => (
                        <SuccessDecryptionPlugin postIdentifier={postIdentifier} message={props.message} />
                    ),
                }}
                headerActions={rightActions}
                title={t('decrypted_postbox_title')}
                message={data.content}
                beforeLatterMetadata={verify}
                {...props.AdditionalContentProps}
            />
        </>
    )
})
function SuccessDecryptionPlugin(props: PluginSuccessDecryptionComponentProps) {
    return (
        <>
            {[...PluginUI.values()]
                .filter((x) => x.shouldActivateInSuccessDecryption(props.message))
                .map((X) => (
                    <X.SuccessDecryptionComponent key={X.identifier} {...props} />
                ))}
        </>
    )
}
