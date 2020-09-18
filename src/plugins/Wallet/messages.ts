import { BatchedMessageCenter } from '../../utils/messages'

export interface MaskbookWalletMessages {}

export const MessageCenter = new BatchedMessageCenter<MaskbookWalletMessages>(true, 'maskbook-wallet-events')
