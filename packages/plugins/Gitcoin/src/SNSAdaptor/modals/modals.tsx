import { SingletonModal } from '@masknet/shared-base'
import type { DonateModalOpenProps } from './DonateModal/index.js'
import type { ResultModalOpenProps } from './ResultModal/index.js'

export const DonateModal = new SingletonModal<DonateModalOpenProps>()
export const ResultModal = new SingletonModal<ResultModalOpenProps>()
