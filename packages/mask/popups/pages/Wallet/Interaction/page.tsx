import { PopupRoutes } from '@masknet/shared-base'
import { useMessages } from '@masknet/web3-hooks-base'
import { memo, useState, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { Interaction } from './interaction.js'

export const Component = memo(function InteractionPage() {
    const navigate = useNavigate()
    const messages = useMessages()
    const [messageIndex, setMessageIndex] = useState(0)
    const currentRequest = messages.at(messageIndex)
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
            />
        </Suspense>
    )
})
