import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Link } from '@mui/material'
import type { Profile } from '../../../database'
import type { TypedMessage } from '@masknet/typed-message'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { DecryptedUI_PluginRendererWithSuggestion } from '../DecryptedPostMetadataRender'

export interface DecryptPostSuccessProps extends withClasses<never> {
    data: { content: TypedMessage }
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean | null
    /** The author in the payload */
    author?: ProfileIdentifier
    /** The author of the encrypted post */
    postedBy?: ProfileIdentifier
}

const useSuccessStyles = makeStyles()((theme) => {
    return {
        header: { display: 'flex', alignItems: 'center' },
        addRecipientsLink: { cursor: 'pointer', marginLeft: theme.spacing(1) },
        signatureVerifyPassed: { display: 'flex' },
        signatureVerifyFailed: { display: 'flex' },
    }
})

export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const {
        data: { content },
        profiles,
        author,
        postedBy,
    } = props
    const classes = useStylesExtends(useSuccessStyles(), props)
    const { t } = useI18N()
    const shareMenu = useShareMenu(
        profiles,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    const rightActions = props.requestAppendRecipients && props.sharedPublic === false && (
        <Link color="primary" onClick={shareMenu.showShare} className={classes.addRecipientsLink}>
            {t('decrypted_postbox_add_recipients')}
        </Link>
    )
    return (
        <>
            {shareMenu.ShareMenu}
            <AdditionalContent
                headerActions={wrapAuthorDifferentMessage(author, postedBy, rightActions)}
                title={t('decrypted_postbox_title')}
                message={content}
            />
            <DecryptedUI_PluginRendererWithSuggestion message={content} metadata={content.meta} />
        </>
    )
})
