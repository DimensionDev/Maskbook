import { memo, useContext, useEffect, useState } from 'react'
import { MaskMessages, useI18N } from '../../../utils/index.js'
import { AdditionalContent } from '../AdditionalPostContent.js'
import { SelectProfileDialog } from '../SelectPeopleDialog.js'
import { makeStyles } from '@masknet/theme'
import { Typography, useTheme } from '@mui/material'
import type { TypedMessage } from '@masknet/typed-message'
import { EMPTY_LIST, type ProfileIdentifier, type ProfileInformation } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage.js'
import { DecryptedUI_PluginRendererWithSuggestion } from '../DecryptedPostMetadataRender.js'
import { PostInfoContext, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useRecipientsList } from '../../CompositionDialog/useRecipientsList.js'
import { useSelectedRecipientsList } from '../../CompositionDialog/useSelectedRecipientsList.js'
import Services from '../../../extension/service.js'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { delay } from '@masknet/kit'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { RecipientsToolTip } from './RecipientsToolTip.js'
import { Icons } from '@masknet/icons'

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
    const { t } = useI18N()
    const iv = usePostInfoDetails.postIVIdentifier()

    useEffect(() => {
        if (message.meta || !iv?.toText()) return
        MaskMessages.events.postReplacerHidden.sendToLocal({ hidden: true, postId: iv.toText() })
    }, [message, iv?.toText()])

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
    const { t } = useI18N()
    const [showDialog, setShowDialog] = useState(false)
    const theme = useTheme()
    const recipients = useRecipientsList()
    const { value: selectedRecipients = EMPTY_LIST, retry } = useSelectedRecipientsList()

    const rightActions =
        props.author?.userId === props.whoAmI?.userId ? (
            canAppendShareTarget && props.whoAmI ? (
                <>
                    {selectedRecipients?.length ? (
                        <RecipientsToolTip recipients={selectedRecipients} openDialog={() => setShowDialog(true)} />
                    ) : (
                        <section className={classes.visibilityBox} onClick={() => setShowDialog(true)}>
                            <Typography color="textPrimary" fontSize={12} fontWeight={500}>
                                {t('decrypted_postbox_only_visible_to_yourself')}
                            </Typography>
                            <div className={classes.iconAdd}>
                                <Icons.AddNoBorder size={12} color={theme.palette.maskColor.white} />
                            </div>
                        </section>
                    )}

                    {showDialog ? (
                        <AppendShareDetail
                            selectedRecipients={selectedRecipients}
                            retry={retry}
                            whoAmI={props.whoAmI}
                            onClose={() => setShowDialog(false)}
                            recipients={recipients}
                        />
                    ) : null}
                </>
            ) : (
                <section className={classes.visibilityBox}>
                    <Typography color="textPrimary" fontSize={12} fontWeight={500}>
                        {t('decrypted_postbox_visible_to_all')}
                    </Typography>
                </section>
            )
        ) : null
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
                await Services.Crypto.appendShareTarget(
                    info.version.getCurrentValue()!,
                    iv,
                    profiles.map((x) => x.identifier),
                    whoAmI,
                    activatedSocialNetworkUI.encryptionNetwork,
                )
                await delay(1500)
                retry()
            }}
        />
    )
}
