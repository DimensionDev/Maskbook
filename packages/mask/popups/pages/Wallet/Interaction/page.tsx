import { PopupRoutes } from '@masknet/shared-base'
import { useMessages } from '@masknet/web3-hooks-base'
import { memo, useState, Suspense, useEffect, use, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { Interaction } from './interaction.js'

export const Component = memo(function InteractionPage() {
    const navigate = useNavigate()
    // if the last message is removed (by either approved or denied) and we're closing the window because the queue is empty,
    // we'll try to hold it for about 200ms so we can make sure there is no subsequent requests.
    // we still need to show the last message, so we're using useDeferredValue here.
    const messages = useDeferredValue(useMessages())
    const [messageIndex, setMessageIndex] = useState(0)
    const currentRequest = messages.at(messageIndex)

    const [pendingAction, setPendingAction] = useState<undefined | Promise<void>>()
    pendingAction && use(pendingAction)

    {
        const [prevLength, setPrev] = useState(messages.length)
        prevLength !== messages.length && setPrev(messages.length)
        if (messages.length) {
            if (messageIndex < 0) setMessageIndex(0)
            // if a new message comes in, switch to that message.
            else if (messageIndex >= messages.length || prevLength !== messages.length)
                setMessageIndex(messages.length - 1)
        }
    }

    const [paymentToken, setPaymentToken] = useState('')

    useEffect(() => {
        if (!messages.length) navigate(PopupRoutes.Wallet, { replace: true })
    }, [messages.length, navigate])
    if (!currentRequest) return null

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <Interaction
                key={currentRequest.ID}
                paymentToken={paymentToken}
                setPaymentToken={setPaymentToken}
                currentRequest={currentRequest}
                totalMessages={messages.length}
                currentMessageIndex={messageIndex}
                setMessageIndex={setMessageIndex}
                setPendingAction={setPendingAction}
            />
        </Suspense>
    )
})
