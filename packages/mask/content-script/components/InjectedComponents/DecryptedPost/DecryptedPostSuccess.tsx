import { memo, useContext, useEffect, useState } from 'react'
import { attachNextIDToProfile } from '../../../../shared/index.js'
import { AdditionalContent } from '../AdditionalPostContent.js'
import { SelectProfileDialog } from '../SelectPeopleDialog.js'
import { makeStyles } from '@masknet/theme'
import { Typography, useTheme } from '@mui/material'
import type { TypedMessage } from '@masknet/typed-message'
import {
    EMPTY_LIST,
    MaskMessages,
    type ProfileIdentifier,
    type ProfileInformation,
    type ProfileInformationFromNextID,
} from '@masknet/shared-base'
import { useAuthorDifferentMessage } from './authorDifferentMessage.js'
import { DecryptedUIPluginRendererWithSuggestion } from '../DecryptedPostMetadataRender.js'
import { PostInfoContext, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useRecipientsList } from '../../CompositionDialog/useRecipientsList.js'
import { useSelectedRecipientsList } from '../../CompositionDialog/useSelectedRecipientsList.js'
import Services from '#services'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { delay } from '@masknet/kit'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/index.js'
import { RecipientsToolTip } from './RecipientsToolTip.js'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

interface DecryptPostSuccessProps {
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
    const currentPostBy = usePostInfoDetails.author()
    // TODO: this should be read from the payload.
    const authorInPayload = currentPostBy
    const postAuthor = authorInPayload || currentPostBy

    if (sharedPublic) return false
    if (version !== -38 && version !== -37) return false
    if (!whoAmI) return false
    if (whoAmI !== postAuthor) return false
    return true
}
const DecryptPostSuccessBase = memo(function DecryptPostSuccessNoShare(
    props: React.PropsWithChildren<DecryptPostSuccessProps>,
) {
    const { message, author, postedBy } = props
    const iv = usePostInfoDetails.postIVIdentifier()

    useEffect(() => {
        if (message.meta || !iv?.toText()) return
        MaskMessages.events.postReplacerHidden.sendToLocal({ hidden: true, postId: iv.toText() })
    }, [message, iv?.toText()])

    return (
        <>
            <AdditionalContent
                title={<Trans>Decrypted by Mask Network</Trans>}
                headerActions={useAuthorDifferentMessage(author, postedBy, props.children)}
                message={message}
            />
            <DecryptedUIPluginRendererWithSuggestion message={message} metadata={message.meta} />
        </>
    )
})

const useStyles = makeStyles<{ canAppendShareTarget: boolean }>()((theme, { canAppendShareTarget }) => {
    return {
        visibilityBox: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing(0.5, 1),
            background: theme.palette.maskColor.bg,
            borderRadius: '999px',
            cursor: canAppendShareTarget ? 'pointer' : 'default',
        },
        iconAdd: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
            background: theme.palette.maskColor.primary,
            borderRadius: '50%',
            height: 16,
            width: 16,
        },
    }
})
export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const canAppendShareTarget = useCanAppendShareTarget(props.whoAmI)
    const { classes } = useStyles({ canAppendShareTarget })
    const [showDialog, setShowDialog] = useState(false)
    const theme = useTheme()
    const recipients = useRecipientsList()
    const { value: selectedRecipients = EMPTY_LIST, retry } = useSelectedRecipientsList()

    const rightActions =
        props.author?.userId === props.whoAmI?.userId ?
            canAppendShareTarget && props.whoAmI ?
                <>
                    {selectedRecipients.length ?
                        <RecipientsToolTip recipients={selectedRecipients} openDialog={() => setShowDialog(true)} />
                    :   <section className={classes.visibilityBox} onClick={() => setShowDialog(true)}>
                            <Typography color="textPrimary" fontSize={12} fontWeight={500}>
                                <Trans>Only visible to yourself</Trans>
                            </Typography>
                            <div className={classes.iconAdd}>
                                <Icons.Plus size={12} color={theme.palette.maskColor.white} />
                            </div>
                        </section>
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
            :   <section className={classes.visibilityBox}>
                    <Typography color="textPrimary" fontSize={12} fontWeight={500}>
                        <Trans>All Mask Network users</Trans>
                    </Typography>
                </section>
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
    const iv = usePostInfoDetails.postIVIdentifier()!

    useEffect(recipients.request, [])

    return (
        <SelectProfileDialog
            open
            selectedProfiles={selectedRecipients}
            profiles={recipients.recipients || EMPTY_LIST}
            onClose={onClose}
            onSelect={async (profiles) => {
                for (const item of profiles) {
                    await attachNextIDToProfile(item as ProfileInformationFromNextID)
                }
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
