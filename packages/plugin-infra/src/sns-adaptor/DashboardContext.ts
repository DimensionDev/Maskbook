import { createContext, useContext } from 'react'
import type { Plugin } from '../types.js'

export const DashboardSNSAdaptorContext = createContext<Plugin.Dashboard.DashboardContext>(null!)
DashboardSNSAdaptorContext.displayName = 'DashboardSNSAdaptorContext'
export const useDashboardSNSAdaptorContext = () => useContext(DashboardSNSAdaptorContext)
import.meta.webpackHot && import.meta.webpackHot.accept()
