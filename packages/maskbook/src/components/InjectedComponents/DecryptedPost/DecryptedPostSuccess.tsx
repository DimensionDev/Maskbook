import { memo, useRef, useEffect } from 'react'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Link } from '@material-ui/core'
import type { Profile } from '../../../database'
import { useStylesExtends } from '../../custom-ui-helper'
import type { TypedMessage } from '../../../protocols/typed-message'
import { PluginUI } from '../../../plugins/PluginUI'
import type { PluginConfig } from '../../../plugins/types'
import { usePostInfo } from '../../DataSource/usePostInfo'
import type { ProfileIdentifier } from '../../../database/type'
import { wrapAuthorDifferentMessage } from './authorDifferentMessage'
import { ErrorBoundary } from '../../shared/ErrorBoundary'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
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

const useSuccessStyles = makeStyles((theme) => {
    return createStyles({
        header: { display: 'flex', alignItems: 'center' },
        addRecipientsLink: { cursor: 'pointer', marginLeft: theme.spacing(1) },
        signatureVerifyPassed: { display: 'flex' },
        signatureVerifyFailed: { display: 'flex' },
    })
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
                metadataRenderer={{ after: SuccessDecryptionPlugin }}
                headerActions={wrapAuthorDifferentMessage(author, postedBy, rightActions)}
                title={t('decrypted_postbox_title')}
                message={content}
                {...props.AdditionalContentProps}
            />
        </>
    )
})
function SuccessDecryptionPlugin(props: PluginSuccessDecryptionComponentProps) {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary contain={`Plugin "${x.pluginName}"`} key={x.identifier}>
                    <PluginSuccessDecryptionPostInspectorForEach pluginConfig={x} {...props} />
                </ErrorBoundary>
            ))}
        </>
    )
}

function PluginSuccessDecryptionPostInspectorForEach(props: { pluginConfig: PluginConfig; message: TypedMessage }) {
    const { pluginConfig, message } = props
    const ref = useRef<HTMLDivElement | null>(null)
    const F = pluginConfig.successDecryptionInspector
    const post = usePostInfo()
    useEffect(() => {
        if (!ref.current || !F || typeof F === 'function') return
        return F.init(post, { message }, ref.current)
    }, [F, post, message])
    if (!F) return null
    if (typeof F === 'function') return <F {...post} message={message} />
    return <div ref={ref} />
}

interface PluginSuccessDecryptionComponentProps {
    message: TypedMessage
}
