export class counter {
    private count = 0
    /**
     * Call this method in methods that should be only run once.
     * If more than once then it could cause memory leak.
     */
    public shouldOnlyRunOnce(msg: string = 'Potential memory leak detected') {
        this.count += 1
        if (this.count > 1) {
            console.warn(msg)
        }
    }
}
