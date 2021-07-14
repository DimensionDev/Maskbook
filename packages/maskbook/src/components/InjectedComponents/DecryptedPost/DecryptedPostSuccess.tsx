import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import type { TypedMessage } from '../../../protocols/typed-message'
import type { ProfileIdentifier } from '../../../database/type'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { useContext } from 'react'
import { AppendRecipients } from '../../DataSource/useAppendRecipients'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.DecryptedInspector)
export interface DecryptPostSuccessProps extends withClasses<never> {
    data: { content: TypedMessage }
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}

const useSuccessStyles = makeStyles((theme) => {
    return {
        header: { display: 'flex', alignItems: 'center' },
        addRecipientsLink: { cursor: 'pointer', marginLeft: theme.spacing(1) },
        signatureVerifyPassed: { display: 'flex' },
        signatureVerifyFailed: { display: 'flex' },
    }
})

export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const classes = useStylesExtends(useSuccessStyles(), props)
    const { t } = useI18N()
    const { author, postedBy } = props
    const { content } = props.data
    const {
        alreadySelectedPreviously,
        enabled: requestAppendRecipientsEnabled,
        friends: profiles,
        requestAppend: requestAppendRecipients,
    } = useContext(AppendRecipients)
    const shareMenu = useShareMenu(profiles, requestAppendRecipients || (() => {}), alreadySelectedPreviously)
    const rightActions = requestAppendRecipientsEnabled && !props.sharedPublic && (
        <Link color="primary" onClick={shareMenu.showShare} className={classes.addRecipientsLink}>
            {t('decrypted_postbox_add_recipients')}
        </Link>
    )
    return (
        <>
            {shareMenu.ShareMenu}
            <AdditionalContent
                metadataRenderer={{ after: PluginRenderer }}
                headerActions={wrapAuthorDifferentMessage(author, postedBy, rightActions)}
                title={t('decrypted_postbox_title')}
                message={content}
                {...props.AdditionalContentProps}
            />
        </>
    )
})
