//#region dhedge
export interface DHedgePool {
    name: string
    managerName: string
    poolDetails: string
    // managed_by:
}

export interface DHedgeFund {
    fund: DHedgePool
}
//#endregion
