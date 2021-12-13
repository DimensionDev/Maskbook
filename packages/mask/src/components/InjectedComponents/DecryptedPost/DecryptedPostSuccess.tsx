import { memo } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Link } from '@mui/material'
import type { Profile } from '../../../database'
import { extractTextFromTypedMessage } from '@masknet/shared-base'
import type { TypedMessage, ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import type { MetadataRendererProps } from '../TypedMessageRenderer'
import {
    useDisabledPluginSuggestionFromMeta,
    useDisabledPluginSuggestionFromPost,
    PossiblePluginSuggestionUI,
} from '../DisabledPluginSuggestion'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.DecryptedInspector)
function PluginRendererWithSuggestion(props: MetadataRendererProps) {
    const a = useDisabledPluginSuggestionFromMeta(props.metadata || new Map())
    const b = useDisabledPluginSuggestionFromPost(extractTextFromTypedMessage(props.message), [])

    const suggest = Array.from(new Set(a.concat(b)))
    return (
        <>
            <PossiblePluginSuggestionUI plugins={suggest} />
            <PluginRenderer {...props} />
        </>
    )
}
export interface DecryptPostSuccessProps extends withClasses<never> {
    data: { content: TypedMessage }
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
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
    const rightActions = props.requestAppendRecipients && !props.sharedPublic && (
        <Link color="primary" onClick={shareMenu.showShare} className={classes.addRecipientsLink}>
            {t('decrypted_postbox_add_recipients')}
        </Link>
    )
    return (
        <>
            {shareMenu.ShareMenu}
            <AdditionalContent
                metadataRenderer={{ after: PluginRendererWithSuggestion }}
                headerActions={wrapAuthorDifferentMessage(author, postedBy, rightActions)}
                title={t('decrypted_postbox_title')}
                message={content}
                {...props.AdditionalContentProps}
            />
        </>
    )
})
