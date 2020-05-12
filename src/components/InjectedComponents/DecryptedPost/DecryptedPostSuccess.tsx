import React from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, useMediaQuery, useTheme, Typography } from '@material-ui/core'
import type { Profile } from '../../../database'
import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { useStylesExtends } from '../../custom-ui-helper'
import type { TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { PluginUI, PluginSuccessDecryptionComponentProps } from '../../../plugins/plugin'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
    data: { signatureVerifyResult: boolean; content: TypedMessage }
    postIdentifier?: PostIdentifier<ProfileIdentifier>
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

const useSuccessStyles = makeStyles({
    header: { display: 'flex', alignItems: 'center' },
    addRecipientsTitle: { marginLeft: '0.25em', marginRight: '0.25em' },
    addRecipientsLink: { marginRight: '1em', cursor: 'pointer' },
    signatureVerifyPassed: { color: 'green', display: 'flex' },
    signatureVerifyFailed: { color: 'red', display: 'flex' },
})

export const DecryptPostSuccess = React.memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const { data, profiles, postIdentifier } = props
    const shareMenu = useShareMenu(
        profiles,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    return (
        <AdditionalContent
            metadataRenderer={{
                after: (props) => <SuccessDecryptionPlugin postIdentifier={postIdentifier} message={props.message} />,
            }}
            header={<DecryptPostSuccessHeader {...props} shareMenu={shareMenu} />}
            message={data.content}
            {...props.AdditionalContentProps}
        />
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

function DecryptPostSuccessHeader(props: { shareMenu: ReturnType<typeof useShareMenu> } & DecryptPostSuccessProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useSuccessStyles(), props)
    const {
        shareMenu: { ShareMenu, showShare },
        data,
        sharedPublic,
    } = props
    const hideTips = !useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <Typography variant="caption" color="textSecondary" gutterBottom className={classes.header}>
            <img alt="" width={16} height={16} src={getUrl('/maskbook-icon-padded.png')} />
            {ShareMenu}
            <span className={classes.addRecipientsTitle}>{t('decrypted_postbox_title')}</span>
            <Box flex={1} />
            {props.requestAppendRecipients && !sharedPublic && (
                <Link color="primary" onClick={showShare} className={classes.addRecipientsLink}>
                    {t('decrypted_postbox_add_recipients')}
                </Link>
            )}
            {data.signatureVerifyResult ? (
                <span className={classes.signatureVerifyPassed}>
                    {hideTips ? t('decrypted_postbox_verified') : null}
                    <CheckIcon fontSize="small" />
                </span>
            ) : (
                <span className={classes.signatureVerifyFailed}>
                    {hideTips ? t('decrypted_postbox_not_verified') : null}
                    <ClearIcon fontSize="small" />
                </span>
            )}
        </Typography>
    )
}
