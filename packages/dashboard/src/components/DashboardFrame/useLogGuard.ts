import { DashboardRoutes } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { Services } from '../../API.js'

export function useLogGuard() {
    const navigate = useNavigate()

    const result = useAsync(async () => {
        const response = await Services.Settings.getLogSettings()
        if (!response) {
            navigate(DashboardRoutes.Welcome, {
                replace: true,
            })
            return
        }
        return response
    })
    return result
}
