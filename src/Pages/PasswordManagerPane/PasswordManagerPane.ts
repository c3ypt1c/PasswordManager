export abstract class PasswordManagerPane {
    listeners = [] as Function[];
    /**
     * This function reconstructs the pane
     */
     abstract updatePane() : void;
    
     /**
      * Will add listener to list of functions to run when changed. 
      * @param listener function to run when data has changed.
      */
     addChangeListener(listener : Function) : void {
        this.listeners.push(listener);
     }

     private onChange() {
        for(let listener = 0; listener < this.listeners.length; listener++) this.listeners[listener]();
     }
}