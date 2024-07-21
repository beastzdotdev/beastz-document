/**
 * @example
 *
 * const bus = new EventBus();
 *
 * // Subscribe to event some-event
 * bus.subscribe('some-event', (obj: object) => {
 *   console.log('Module A', obj);
 * });
 *
 * // publish event some-event
 * bus.publish('some-event', { msg: 'some-event published!' });
 */
export class EventBus {
  private eventObject: { [key: string]: CallableFunction[] };

  constructor() {
    // initialize event list
    this.eventObject = {};
  }
  // publish event
  publish(eventName: string, ...args: any[]) {
    // Get all the callback functions of the current event
    const callbackList = this.eventObject[eventName];

    if (!callbackList) return console.warn(eventName + ' not found!');

    // execute each callback function
    for (let callback of callbackList) {
      // pass parameters when executing
      callback(...args);
    }
  }
  // Subscribe to events
  subscribe(eventName: string, callback: CallableFunction) {
    // initialize this event
    if (!this.eventObject[eventName]) {
      this.eventObject[eventName] = [];
    }

    // store the callback function of the subscriber
    this.eventObject[eventName].push(callback);
  }
}

/**
 * @description This is a singleton global bus.
 */
export const bus = new EventBus();
