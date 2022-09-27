import { createContext } from 'react'
import type { ProposalIdentifier } from './types.js'

export const FindTrumanContext = createContext<ProposalIdentifier>(null!)
