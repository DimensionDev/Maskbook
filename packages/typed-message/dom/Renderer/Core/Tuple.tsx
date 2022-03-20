import { memo, useMemo } from 'react'
import type { TypedMessageTuple, TypedMessageTextV1, TypedMessageImage } from '../../../base'
import { hasCircular } from '../utils/circularDetect'
import { TypedMessageRenderInline } from '../Entry'
import { useMetadataRender } from '../MetadataRender'

const ENCODED_IMAGE = 'https://static.xx.fbcdn.net/images/emoji.php/v9/t6b/2/16/1f3bc.png'
const ENCODED_TESTER = /^\s\u{1F3BC}[1-4]\/4[\s\S]+:\|\|$/u

export const TypedMessageTupleRenderer = memo(function TypedMessageTupleRenderer(props: TypedMessageTuple) {
    const meta = useMetadataRender(props)
    if (useMemo(() => hasCircular(props.items), [props.items])) return null

    return (
        <>
            {props.items
                .filter((message) => {
                    if (message.type === 'text' && ENCODED_TESTER.test((message as TypedMessageTextV1).content)) {
                        return false
                    }

                    if (message.type === 'image' && (message as TypedMessageImage).image === ENCODED_IMAGE) {
                        return false
                    }

                    return true
                })
                .map((message, index) => (
                    <TypedMessageRenderInline key={index} {...props} message={message} />
                ))}
            {meta}
        </>
    )
})
