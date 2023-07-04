import { createContext } from 'react'
import type { ProposalIdentifier } from './types.js'

export const SnapshotContext = createContext<ProposalIdentifier>(null!)
SnapshotContext.displayName = 'SnapshotContext'
