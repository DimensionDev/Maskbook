import { type TypedMessage, makeTypedMessageText } from '@masknet/typed-message'
import { TypedMessageRender } from '@masknet/typed-message-react'
import { useMemo, type ReactNode } from 'react'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import {
    AdditionalContent as AdditionalContentUI,
    type AdditionalContentProps as AdditionalContentUIProps,
} from '@masknet/injected-ui/AdditionalContent'

export interface AdditionalContentProps extends Omit<AdditionalContentUIProps, 'message'> {
    /** Can handle typed message or normal string */
    message?: TypedMessage | string
}

export function AdditionalContent(props: AdditionalContentProps) {
    const { message, ...rest } = props
    const TypedMessage = useMemo(() => {
        if (typeof message === 'string') return makeTypedMessageText(message)
        return message
    }, [message])

    const rendered: ReactNode = message && TypedMessage && (
        <TypedMessageRenderContext
            textResizer={activatedSiteAdaptorUI!.networkIdentifier !== 'twitter.com'}
            renderFragments={activatedSiteAdaptorUI?.customization.componentOverwrite?.RenderFragments}>
            <TypedMessageRender message={TypedMessage} />
        </TypedMessageRenderContext>
    )

    return <AdditionalContentUI {...rest} message={rendered} />
}
