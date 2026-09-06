import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { delay } from '@masknet/kit'
import {
    PostInfoContext,
    usePostInfoAuthor,
    usePostInfoPostIVIdentifier,
    usePostInfoPublicShared,
    usePostInfoVersion,
} from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, MaskMessages, type ProfileIdentifier, type ProfileInformation } from '@masknet/shared-base'
import type { TypedMessage } from '@masknet/typed-message'
import { memo, useContext, useEffect, useState } from 'react'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { useRecipientsList } from '../../CompositionDialog/useRecipientsList.js'
import { useSelectedRecipientsList } from '../../CompositionDialog/useSelectedRecipientsList.js'
import { AdditionalContent } from '../AdditionalPostContent.js'
import { DecryptedUIPluginRendererWithSuggestion } from '../DecryptedPostMetadataRender.js'
import { SelectProfileDialog } from '../SelectPeopleDialog.js'
import { getAuthorDifferentMessage } from './authorDifferentMessage.js'
import { RecipientsToolTip } from '@masknet/injected-ui/RecipientsToolTip'
import { PostVisibilityBadge } from '@masknet/injected-ui/PostVisibilityBadge'

interface DecryptPostSuccessBaseProps {
    message: TypedMessage
    /** The author in the payload */
    author: ProfileIdentifier | null
    /** The author of the encrypted post */
    postedBy: ProfileIdentifier | null
}
interface DecryptPostSuccessProps extends DecryptPostSuccessBaseProps {
    whoAmI: ProfileIdentifier | null
}

function useCanAppendShareTarget(whoAmI: ProfileIdentifier | null): whoAmI is ProfileIdentifier {
    const version = usePostInfoVersion()
    const sharedPublic = usePostInfoPublicShared()
    const currentPostBy = usePostInfoAuthor()

    if (sharedPublic) return false
    if (version !== -38 && version !== -37) return false
    if (!whoAmI) return false

    // TODO: this should be read from the payload.
    const authorInPayload = currentPostBy
    const postAuthor = authorInPayload || currentPostBy
    return whoAmI === postAuthor
}
const DecryptPostSuccessBase = memo(function DecryptPostSuccessNoShare(
    props: React.PropsWithChildren<DecryptPostSuccessBaseProps>,
) {
    const { message, author, postedBy } = props
    const iv = usePostInfoPostIVIdentifier()

    useEffect(() => {
        if (message.meta || !iv?.toText()) return
        MaskMessages.events.postReplacerHidden.sendToLocal({ hidden: true, postId: iv.toText() })
    }, [message, iv?.toText()])

    return (
        <>
            <AdditionalContent
                title={<Trans>Decrypted by Mask Network</Trans>}
                headerActions={getAuthorDifferentMessage(author, postedBy, props.children)}
                message={message}
            />
            <DecryptedUIPluginRendererWithSuggestion message={message} metadata={message.meta} />
        </>
    )
})

export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const canAppendShareTarget = useCanAppendShareTarget(props.whoAmI)
    const [showDialog, setShowDialog] = useState(false)
    const recipients = useRecipientsList()
    const { value: selectedRecipients = EMPTY_LIST, retry } = useSelectedRecipientsList()

    const rightActions =
        props.author?.userId === props.whoAmI?.userId ?
            canAppendShareTarget && props.whoAmI ?
                <>
                    {selectedRecipients.length ?
                        <RecipientsToolTip recipients={selectedRecipients} openDialog={() => setShowDialog(true)} />
                    :   <PostVisibilityBadge
                            variant="onlyYou"
                            label={<Trans>Only visible to yourself</Trans>}
                            onClick={() => setShowDialog(true)}
                        />
                    }

                    {showDialog ?
                        <AppendShareDetail
                            selectedRecipients={selectedRecipients}
                            retry={retry}
                            whoAmI={props.whoAmI}
                            onClose={() => setShowDialog(false)}
                            recipients={recipients}
                        />
                    :   null}
                </>
            :   <PostVisibilityBadge variant="everyone" label={<Trans>All Mask Network users</Trans>} />
        :   null
    return <DecryptPostSuccessBase {...props}>{rightActions}</DecryptPostSuccessBase>
})

interface Props {
    onClose(): void
    recipients: LazyRecipients
    whoAmI: ProfileIdentifier
    selectedRecipients: ProfileInformation[]
    retry(): void
}
function AppendShareDetail({ recipients, selectedRecipients, onClose, whoAmI, retry }: Props) {
    const info = useContext(PostInfoContext)!
    const iv = usePostInfoPostIVIdentifier()!

    useEffect(recipients.request, [])

    return (
        <SelectProfileDialog
            open
            selectedProfiles={selectedRecipients}
            profiles={recipients.recipients || EMPTY_LIST}
            onClose={onClose}
            onSelect={async (profiles) => {
                await Services.Crypto.appendShareTarget(
                    info.version.getCurrentValue()!,
                    iv,
                    profiles.map((x) => ({ profile: x.identifier, persona: x.linkedPersona })),
                    whoAmI,
                    activatedSiteAdaptorUI!.encryptPayloadNetwork,
                )
                await delay(1500)
                retry()
            }}
        />
    )
}
