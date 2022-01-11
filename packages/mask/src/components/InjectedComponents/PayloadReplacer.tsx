import { Typography, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../utils'
import {
    isTypedMessageAnchor,
    isTypedMessageText,
    makeTypedMessageText,
    makeTypedMessageTuple,
    TypedMessage,
    visitEachTypedMessageChild,
} from '@masknet/shared-base'
import { memo } from 'react'
import type { TypedMessageRendererProps } from './TypedMessageRenderer'
import { registerTypedMessageRenderer } from '../../protocols/typed-message'

const useStyle = makeStyles()((theme) => ({
    text: {
        fontSize: 'inherit',
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
}))

const TypedMessageExtension_MaskPayloadReplacerType = 'mask-x.payload-replacer'
interface TypedMessageExtension_MaskPayloadReplacer extends TypedMessage {
    link?: string
    type: typeof TypedMessageExtension_MaskPayloadReplacerType
}
// match the link version payload
const shouldReplace = /^https?:\/\/mask(\.io|book\.com)\/\?PostData_v/i
// match the text version payload
const shouldReplace2 = /(🎼[\d\/\|\w=]+:\|\|)/gi
const PayloadReplacer = memo(({ link }: { link?: string }) => {
    const { t } = useI18N()
    const { classes } = useStyle()
    return (
        <Typography className={classes.text} color="textPrimary" component="span" variant="body1">
            <Link href={link || 'https://mask.io'}>{t('post_substitute_label')}</Link>
        </Typography>
    )
})
export function PayloadReplacerTransformer(message: TypedMessage): TypedMessage {
    if (isTypedMessageAnchor(message)) {
        if (shouldReplace.test(message.content)) {
            const alt: TypedMessageExtension_MaskPayloadReplacer = {
                type: TypedMessageExtension_MaskPayloadReplacerType,
                link: message.href,
            }
            return alt
        }
    } else if (isTypedMessageText(message)) {
        if (!message.content.includes('🎼')) return message
        const split = message.content.split(shouldReplace2)
        if (split.length === 1) return message
        const alt: TypedMessageExtension_MaskPayloadReplacer = {
            type: TypedMessageExtension_MaskPayloadReplacerType,
        }
        return makeTypedMessageTuple(split.map((x) => (shouldReplace2.test(x) ? alt : makeTypedMessageText(x))))
    }

    return visitEachTypedMessageChild(message, PayloadReplacerTransformer)
}

const MaskPayloadReplacer = memo(function MaskPayloadReplacer(
    props: TypedMessageRendererProps<TypedMessageExtension_MaskPayloadReplacer>,
) {
    return <PayloadReplacer link={props.message.link} />
})
registerTypedMessageRenderer(TypedMessageExtension_MaskPayloadReplacerType, {
    component: MaskPayloadReplacer,
    id: TypedMessageExtension_MaskPayloadReplacerType,
    priority: 0,
})
