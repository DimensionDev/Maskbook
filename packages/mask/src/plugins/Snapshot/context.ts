import { createContext } from 'react'
import type { ProposalIdentifier } from './types'

export const SnapshotContext = createContext<ProposalIdentifier>(null!)
