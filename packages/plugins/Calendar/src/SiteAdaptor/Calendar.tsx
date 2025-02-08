import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PluginID } from '@masknet/shared-base'
import { useLocationChange } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { CalendarContent } from './CalendarContent.js'

interface Props {
    target?: '/explore' | '/search'
}

export function Calendar({ target }: Props) {
    const [pathname, setPathname] = useState(location.pathname)
    const isMinimalMode = useIsMinimalMode(PluginID.Calendar)

    useLocationChange(() => {
        setPathname(location.pathname)
    })
    if (isMinimalMode || (target && !pathname.includes(target))) return null
    if (!target && ['/search', '/explore'].includes(pathname)) return null

    return <CalendarContent style={{ marginTop: pathname.includes('explore') ? 24 : 0 }} />
}
