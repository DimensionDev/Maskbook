import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { createContext } from 'react'

export const CompositionTypeContext = createContext<CompositionType>('timeline')
