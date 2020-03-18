import React from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { getUrl } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, useMediaQuery, useTheme, Typography } from '@material-ui/core'
import { Profile } from '../../../database'
import { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { useStylesExtends } from '../../custom-ui-helper'
import { TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import RedPacketInDecryptedPost from '../../../plugins/Wallet/UI/RedPacket/RedPacketInDecryptedPost'

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
    signatureVerifyPassed: { color: 'green' },
    signatureVerifyFailed: { color: 'red' },
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
                after: props => <RedPacketInDecryptedPost message={props.message} postIdentifier={postIdentifier} />,
            }}
            header={<DecryptPostSuccessHeader {...props} shareMenu={shareMenu} />}
            message={data.content}
            {...props.AdditionalContentProps}
        />
    )
})

function DecryptPostSuccessHeader(props: { shareMenu: ReturnType<typeof useShareMenu> } & DecryptPostSuccessProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useSuccessStyles(), props)
    const {
        shareMenu: { ShareMenu, showShare },
        data,
        sharedPublic,
    } = props
    let passString = t('decrypted_postbox_verified')
    let failString = t('decrypted_postbox_not_verified')

    if (useMediaQuery(theme.breakpoints.down('sm'))) {
        passString = '✔'
        failString = '❌'
    }
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
                <span className={classes.signatureVerifyPassed}>{passString}</span>
            ) : (
                <span className={classes.signatureVerifyFailed}>{failString}</span>
            )}
        </Typography>
    )
}
