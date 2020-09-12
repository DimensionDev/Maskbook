import type { Currency, DataProvider, ERC20Token } from './types'
import { BatchedMessageCenter } from '../../utils/messages'

export interface MaskbookWalletMessages {}

export const MessageCenter = new BatchedMessageCenter<MaskbookWalletMessages>(true, 'maskbook-wallet-events')
