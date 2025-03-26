export interface PortalContainerProps {
    portalContainerRef: React.RefObject<HTMLDivElement | null>
}

export enum StorageType {
    Local = 'local',
    Cloud = 'cloud',
}
