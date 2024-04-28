import { CrossIsolationMessages } from '@masknet/shared-base'
import { hmr } from '../../../utils-pure/index.js'
import { setAutoLockTimer } from '../../services/wallet/services/index.js'

const { signal } = hmr(import.meta.webpackHot)
// Reset timer
CrossIsolationMessages.events.walletLockStatusUpdated.on(() => setAutoLockTimer(), { signal })
