import { t } from '@lingui/core/macro'
import { ApplicationBoardModal } from '@masknet/shared'
import { SolanaRedPacketMetaKey } from '@masknet/shared-base'
import type { FireflyRedPacketAPI, RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { useCallback, useContext } from 'react'
import { openComposition } from '../openComposition.js'
import { reduceUselessPayloadInfo } from '../utils/reduceUselessPayloadInfo.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'

interface Options {
    senderName?: string
    onClose?: () => void
}

export function useHandleSolanaCreateOrSelect({ senderName, onClose }: Options) {
    const compositionType = useContext(CompositionTypeContext)
    return useCallback(
        async (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            if (senderName) {
                payload.sender.name === senderName
            }

            const post = t`Hi friends, I just created a token Lucky Drop. Download mask.io to claim. Follow @realMaskNetwork for Web3 updates and insights.

🧧🧧🧧 Try sending Lucky Drop to your friends with Mask io.`
            openComposition(
                SolanaRedPacketMetaKey,
                reduceUselessPayloadInfo(payload),
                compositionType,
                {
                    payloadImage,
                    claimRequirements,
                    publicKey,
                },
                post,
            )
            Telemetry.captureEvent(EventType.Access, EventID.EntryAppLuckCreate)
            ApplicationBoardModal.close()
            onClose?.()
        },
        [senderName, onClose, compositionType],
    )
}
