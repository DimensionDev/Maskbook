export class MemoryLeakProbe {
    private counter = 0;
    /**
     * Call this method in methods that should be only run once.
     * If more than once then it could cause memory leak.
     */
    public shouldOnlyRunOnce() {
        this.counter += 1;
        if (this.counter > 1) {
            console.warn("Potential memory leak detected")
        }
    }
}
