import React from 'react'
import classNames from 'classnames'
import { AdditionalContent, AdditionalContentProps } from '../AdditionalPostContent'
import { useShareMenu } from '../SelectPeopleDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Link, Typography, CircularProgress } from '@material-ui/core'
import type { Profile } from '../../../database'
import { useStylesExtends } from '../../custom-ui-helper'
import type { TypedMessage } from '../../../protocols/typed-message'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { PluginUI, PluginConfig } from '../../../plugins/plugin'
import type { SuccessDecryption } from '../../../extension/background-script/CryptoServices/decryptFrom'
import { usePostInfo } from '../../DataSource/usePostInfo'
import { useColorStyles } from '../../../utils/theme'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
    data: { signatureVerifyResult: SuccessDecryption['signatureVerifyResult']; content: TypedMessage }
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

const useSuccessStyles = makeStyles((theme) => {
    const dark = theme.palette.type === 'dark'
    return createStyles({
        header: { display: 'flex', alignItems: 'center' },
        addRecipientsLink: { cursor: 'pointer' },
        signatureVerifyPassed: { display: 'flex' },
        signatureVerifyFailed: { display: 'flex' },
    })
})

export const DecryptPostSuccess = React.memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const {
        data: { content, signatureVerifyResult },
        profiles,
    } = props
    const classes = useStylesExtends(useSuccessStyles(), props)
    const color = useColorStyles()
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
    const verify =
        signatureVerifyResult === 'verifying' ? (
            <Typography variant="caption" className={classNames(classes.signatureVerifyPassed, color.success)}>
                {t('decrypted_postbox_verifying')}
                <CircularProgress style={{ marginLeft: 6 }} variant="indeterminate" size={16} />
            </Typography>
        ) : signatureVerifyResult ? (
            <Typography variant="caption" className={classNames(classes.signatureVerifyPassed, color.success)}>
                {t('decrypted_postbox_verified')}
                <CheckIcon fontSize="small" />
            </Typography>
        ) : (
            <Typography variant="caption" className={classNames(classes.signatureVerifyFailed, color.error)}>
                {t('decrypted_postbox_not_verified')}
                <ClearIcon fontSize="small" />
            </Typography>
        )
    return (
        <>
            {shareMenu.ShareMenu}
            <AdditionalContent
                metadataRenderer={{ after: SuccessDecryptionPlugin }}
                headerActions={rightActions}
                title={t('decrypted_postbox_title')}
                message={content}
                beforeLatterMetadata={verify}
                {...props.AdditionalContentProps}
            />
        </>
    )
})
function SuccessDecryptionPlugin(props: PluginSuccessDecryptionComponentProps) {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <PluginSuccessDecryptionPostInspectorForEach key={x.identifier} pluginConfig={x} {...props} />
            ))}
        </>
    )
}

function PluginSuccessDecryptionPostInspectorForEach(props: { pluginConfig: PluginConfig; message: TypedMessage }) {
    const { pluginConfig, message } = props
    const ref = React.useRef<HTMLDivElement | null>(null)
    const F = pluginConfig.successDecryptionInspector
    const post = usePostInfo()
    React.useEffect(() => {
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
