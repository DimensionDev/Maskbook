import { createContext, useContext } from 'react'
import type { Plugin } from '../types.js'

export const SNSAdaptorContext = createContext<Plugin.SNSAdaptor.SNSAdaptorContext>(null!)
SNSAdaptorContext.displayName = 'SNSAdaptorContext'
export const useSNSAdaptorContext = () => useContext(SNSAdaptorContext)
import.meta.webpackHot && import.meta.webpackHot.accept()
