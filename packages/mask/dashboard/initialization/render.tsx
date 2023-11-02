import './i18n.js'
import { lazy } from 'react'
import { createNormalReactRoot } from '../../shared-ui/utils/createNormalReactRoot.js'

const Dashboard = lazy(() => import(/* webpackMode: 'eager' */ '../Dashboard.js'))
createNormalReactRoot(<Dashboard />)
