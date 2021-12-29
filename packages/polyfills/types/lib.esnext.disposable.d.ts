interface SymbolConstructor {
    /**
     * A method that returns the destructor for an object. Called by the semantics of the `using const` statement.
     */
    readonly dispose: unique symbol
    /**
     * A method that returns the destructor for an object. Called by the semantics of the `using const` statement.
     */
    readonly asyncDispose: unique symbol
}
