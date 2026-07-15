import { useQuery } from '@tanstack/react-query'
import Services from '#services'

export function useBackupPreviewInfo() {
    return useQuery({
        queryKey: ['backup', 'preview-info'],
        queryFn: () => Services.Backup.generateBackupPreviewInfo(),
        refetchInterval: 600_000,
        refetchOnWindowFocus: true,
    })
}
