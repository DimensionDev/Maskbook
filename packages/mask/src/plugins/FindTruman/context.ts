import { createContext } from 'react'
import type { ProposalIdentifier } from './types'

export const FindTrumanContext = createContext<ProposalIdentifier>(null!)
