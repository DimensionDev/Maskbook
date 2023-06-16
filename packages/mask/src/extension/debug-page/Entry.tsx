import { DebugInfo } from './DebugInfo.js'
import { DatabaseOps } from './DatabaseOps.js'

export function Entry() {
    return (
        <>
            <DebugInfo />
            <DatabaseOps />
        </>
    )
}
