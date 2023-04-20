import { createContext, useContext } from 'react'
import type { Plugin } from '../types.js'

export const SNSAdaptorContext = createContext<Plugin.SNSAdaptor.SNSAdaptorContext>(null!)
SNSAdaptorContext.displayName = 'SNSAdaptorContext'

export const useSNSAdaptorContext = () => useContext(SNSAdaptorContext)
// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
import.meta.webpackHot && import.meta.webpackHot.accept()
