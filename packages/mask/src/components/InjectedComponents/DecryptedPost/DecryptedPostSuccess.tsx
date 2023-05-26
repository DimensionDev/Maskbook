import { memo, useContext, useEffect, useState } from 'react'
import { useI18N } from '../../../utils/index.js'
import { AdditionalContent } from '../AdditionalPostContent.js'
import { SelectProfileDialog } from '../SelectPeopleDialog.js'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { TypedMessage } from '@masknet/typed-message'
import { EMPTY_LIST, type ProfileIdentifier } from '@masknet/shared-base'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage.js'
import { DecryptedUI_PluginRendererWithSuggestion } from '../DecryptedPostMetadataRender.js'
import { PostInfoContext, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { useRecipientsList } from '../../CompositionDialog/useRecipientsList.js'
import { useSelectedRecipientsList } from '../../CompositionDialog/useSelectedRecipientsList.js'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service.js'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { delay } from '@masknet/kit'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'

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
            padding: theme.spacing(0.5, 1),
            background: theme.palette.maskColor.bg,
            borderRadius: '999px',
            cursor: canAppendShareTarget ? 'pointer' : 'default',
        },
    }
})
export const DecryptPostSuccess = memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const canAppendShareTarget = useCanAppendShareTarget(props.whoAmI)
    const { classes } = useStyles({ canAppendShareTarget })
    const { t } = useI18N()
    const [showDialog, setShowDialog] = useState(false)
    const recipients = useRecipientsList()
    const { value: alreadySelectedPreviously } = useSelectedRecipientsList()

    const rightActions =
        props.author?.userId === props.whoAmI?.userId ? (
            canAppendShareTarget && props.whoAmI ? (
                <>
                    {!alreadySelectedPreviously?.length ? (
                        <section className={classes.visibilityBox} onClick={() => setShowDialog(true)}>
                            <Typography color="textPrimary" fontSize={12} fontWeight={500}>
                                {t('decrypted_postbox_only_visible_to_yourself')}
                            </Typography>
                        </section>
                    ) : (
                        <section className={classes.visibilityBox} onClick={() => setShowDialog(true)}>
                            {1234}
                        </section>
                    )}
                    {showDialog ? (
                        <AppendShareDetail
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

function AppendShareDetail(props: { onClose(): void; recipients: LazyRecipients; whoAmI: ProfileIdentifier }) {
    const info = useContext(PostInfoContext)!
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
                    activatedSocialNetworkUI.encryptionNetwork,
                )
                await delay(1500)
                retry()
            }}
        />
    )
}
