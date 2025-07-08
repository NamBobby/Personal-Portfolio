// Event Manager for Portfolio Application
class EventManager {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.maxListeners = 100;
        
        // Bind methods to preserve context
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
        this.once = this.once.bind(this);
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     * @param {Object} options - Optional configuration
     */
    on(event, listener, options = {}) {
        if (typeof event !== 'string' || typeof listener !== 'function') {
            throw new Error('Event must be a string and listener must be a function');
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event);
        
        // Check max listeners limit
        if (eventListeners.length >= this.maxListeners) {
            console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event: ${event}`);
        }

        // Add listener with metadata
        const listenerObj = {
            fn: listener,
            context: options.context || null,
            priority: options.priority || 0,
            id: this._generateListenerId()
        };

        eventListeners.push(listenerObj);
        
        // Sort by priority (higher priority first)
        eventListeners.sort((a, b) => b.priority - a.priority);

        return listenerObj.id;
    }

    /**
     * Add one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     * @param {Object} options - Optional configuration
     */
    once(event, listener, options = {}) {
        if (typeof event !== 'string' || typeof listener !== 'function') {
            throw new Error('Event must be a string and listener must be a function');
        }

        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }

        const listenerObj = {
            fn: listener,
            context: options.context || null,
            priority: options.priority || 0,
            id: this._generateListenerId()
        };

        this.onceListeners.get(event).push(listenerObj);
        
        // Sort by priority
        this.onceListeners.get(event).sort((a, b) => b.priority - a.priority);

        return listenerObj.id;
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function|string} listenerOrId - Listener function or listener ID
     */
    off(event, listenerOrId) {
        if (typeof event !== 'string') {
            throw new Error('Event must be a string');
        }

        // Remove from regular listeners
        if (this.listeners.has(event)) {
            const eventListeners = this.listeners.get(event);
            const index = this._findListenerIndex(eventListeners, listenerOrId);
            
            if (index !== -1) {
                eventListeners.splice(index, 1);
                
                // Clean up empty arrays
                if (eventListeners.length === 0) {
                    this.listeners.delete(event);
                }
                return true;
            }
        }

        // Remove from once listeners
        if (this.onceListeners.has(event)) {
            const eventListeners = this.onceListeners.get(event);
            const index = this._findListenerIndex(eventListeners, listenerOrId);
            
            if (index !== -1) {
                eventListeners.splice(index, 1);
                
                if (eventListeners.length === 0) {
                    this.onceListeners.delete(event);
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to listeners
     */
    emit(event, ...args) {
        if (typeof event !== 'string') {
            throw new Error('Event must be a string');
        }

        let listenerCount = 0;
        const eventData = {
            type: event,
            timestamp: Date.now(),
            preventDefault: false,
            stopPropagation: false,
            data: args.length === 1 ? args[0] : args
        };

        // Create event object with control methods
        const eventObj = {
            ...eventData,
            preventDefault: () => { eventData.preventDefault = true; },
            stopPropagation: () => { eventData.stopPropagation = true; }
        };

        try {
            // Execute once listeners first
            if (this.onceListeners.has(event)) {
                const onceListeners = [...this.onceListeners.get(event)];
                this.onceListeners.delete(event); // Remove all once listeners
                
                for (const listenerObj of onceListeners) {
                    if (eventData.stopPropagation) break;
                    
                    this._executeListener(listenerObj, eventObj, args);
                    listenerCount++;
                }
            }

            // Execute regular listeners
            if (this.listeners.has(event) && !eventData.stopPropagation) {
                const listeners = this.listeners.get(event);
                
                for (const listenerObj of listeners) {
                    if (eventData.stopPropagation) break;
                    
                    this._executeListener(listenerObj, eventObj, args);
                    listenerCount++;
                }
            }

        } catch (error) {
            console.error(`Error emitting event '${event}':`, error);
            this._emitError(event, error, args);
        }

        return {
            event,
            listenerCount,
            preventDefault: eventData.preventDefault,
            stopPropagation: eventData.stopPropagation
        };
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name (optional, removes all if not specified)
     */
    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * Get all event names that have listeners
     */
    getEventNames() {
        const regularEvents = Array.from(this.listeners.keys());
        const onceEvents = Array.from(this.onceListeners.keys());
        
        return [...new Set([...regularEvents, ...onceEvents])];
    }

    /**
     * Get listener count for an event
     */
    getListenerCount(event) {
        const regular = this.listeners.has(event) ? this.listeners.get(event).length : 0;
        const once = this.onceListeners.has(event) ? this.onceListeners.get(event).length : 0;
        
        return regular + once;
    }

    /**
     * Set maximum listeners per event
     */
    setMaxListeners(max) {
        if (typeof max !== 'number' || max < 0) {
            throw new Error('Max listeners must be a non-negative number');
        }
        this.maxListeners = max;
    }

    /**
     * Create a namespaced event manager
     */
    namespace(prefix) {
        return {
            on: (event, listener, options) => this.on(`${prefix}:${event}`, listener, options),
            off: (event, listenerOrId) => this.off(`${prefix}:${event}`, listenerOrId),
            emit: (event, ...args) => this.emit(`${prefix}:${event}`, ...args),
            once: (event, listener, options) => this.once(`${prefix}:${event}`, listener, options)
        };
    }

    // Private methods
    _executeListener(listenerObj, eventObj, args) {
        try {
            if (listenerObj.context) {
                listenerObj.fn.call(listenerObj.context, eventObj, ...args);
            } else {
                listenerObj.fn(eventObj, ...args);
            }
        } catch (error) {
            console.error('Error in event listener:', error);
            throw error;
        }
    }

    _findListenerIndex(listeners, listenerOrId) {
        if (typeof listenerOrId === 'string') {
            // Find by ID
            return listeners.findIndex(l => l.id === listenerOrId);
        } else if (typeof listenerOrId === 'function') {
            // Find by function reference
            return listeners.findIndex(l => l.fn === listenerOrId);
        }
        return -1;
    }

    _generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _emitError(originalEvent, error, args) {
        // Emit error event, but don't let it throw to prevent infinite loops
        try {
            this.emit('error', {
                originalEvent,
                error,
                args
            });
        } catch (errorEventError) {
            console.error('Error in error event handler:', errorEventError);
        }
    }

    // Debug methods
    debug() {
        return {
            listeners: this.listeners,
            onceListeners: this.onceListeners,
            eventNames: this.getEventNames(),
            totalListeners: this.getEventNames().reduce((total, event) => {
                return total + this.getListenerCount(event);
            }, 0)
        };
    }

    // Cleanup
    destroy() {
        this.removeAllListeners();
        console.log('EventManager destroyed');
    }
}