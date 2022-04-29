import { memo, useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { AdditionalContent } from '../AdditionalPostContent'
import { SelectProfileDialog } from '../SelectPeopleDialog'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import type { TypedMessage } from '@masknet/typed-message'
import { EMPTY_LIST, ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { DecryptedUI_PluginRendererWithSuggestion } from '../DecryptedPostMetadataRender'
import { usePostInfo, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { usePostClaimedAuthor } from '../../DataSource/usePostInfo'
import { useRecipientsList } from '../../CompositionDialog/useRecipientsList'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { delay } from '@dimensiondev/kit'

export interface DecryptPostSuccessProps {
    message: TypedMessage
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
    whoAmI: ProfileIdentifier | null
}

function useCanAppendShareTarget(whoAmI: ProfileIdentifier | null): whoAmI is ProfileIdentifier {
    const version = usePostInfoDetails.version()
    const sharedPublic = usePostInfoDetails.publicShared()
    const authorInPayload = usePostClaimedAuthor()
    const currentPostBy = usePostInfoDetails.author()
    const postAuthor = authorInPayload || currentPostBy

    if (sharedPublic) return false
    if (version !== -38) return false
    if (!whoAmI) return false
    if (whoAmI !== postAuthor) return false
    return true
}
export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const { whoAmI } = props
    const canShare = useCanAppendShareTarget(whoAmI)
    if (canShare) return <DecryptPostSuccessAppendShare {...props} whoAmI={whoAmI} />
    return <DecryptPostSuccessBase {...props} />
})
const DecryptPostSuccessBase = memo(function DecryptPostSuccessNoShare(
    props: React.PropsWithChildren<DecryptPostSuccessProps>,
) {
    const { message, author, postedBy } = props
    const { t } = useI18N()
    return (
        <>
            <AdditionalContent
                title={t('decrypted_postbox_title')}
                headerActions={wrapAuthorDifferentMessage(author, postedBy, props.children)}
                message={message}
            />
            <DecryptedUI_PluginRendererWithSuggestion message={message} metadata={message.meta} />
        </>
    )
})

const useStyles = makeStyles()((theme) => {
    return {
        addRecipientsLink: { cursor: 'pointer', marginLeft: theme.spacing(1) },
    }
})
const DecryptPostSuccessAppendShare = memo(function DecryptPostSuccessAppendShare(
    props: DecryptPostSuccessProps & { whoAmI: ProfileIdentifier },
) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [showDialog, setShowDialog] = useState(false)
    const recipients = useRecipientsList()
    const canAppendShareTarget = useCanAppendShareTarget(props.whoAmI) && recipients.hasRecipients

    const rightActions = canAppendShareTarget ? (
        <>
            <Link color="primary" onClick={() => setShowDialog(true)} className={classes.addRecipientsLink}>
                {t('decrypted_postbox_add_recipients')}
            </Link>
            {showDialog && (
                <AppendShareDetail whoAmI={props.whoAmI} onClose={() => setShowDialog(false)} recipients={recipients} />
            )}
        </>
    ) : null
    return <DecryptPostSuccessBase {...props}>{rightActions}</DecryptPostSuccessBase>
})

function AppendShareDetail(props: { onClose(): void; recipients: LazyRecipients; whoAmI: ProfileIdentifier }) {
    const info = usePostInfo()!
    const iv = usePostInfoDetails.postIVIdentifier()!
    const { value: alreadySelectedPreviously = EMPTY_LIST, retry } = useAsyncRetry(
        () => Services.Crypto.getIncompleteRecipientsOfPost(iv),
        [iv],
    )
    useEffect(props.recipients.request, [])

    return (
        <SelectProfileDialog
            open
            alreadySelectedPreviously={alreadySelectedPreviously}
            profiles={props.recipients.recipients || EMPTY_LIST}
            onClose={props.onClose}
            onSelect={async (profiles) => {
                await Services.Crypto.appendShareTarget(
                    info.version.getCurrentValue()!,
                    iv,
                    profiles.map((x) => x.identifier),
                    props.whoAmI,
                )
                await delay(1500)
                retry()
            }}
        />
    )
}
