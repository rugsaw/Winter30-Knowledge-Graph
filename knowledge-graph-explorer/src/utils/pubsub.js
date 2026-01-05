class MessageBus {
    constructor() {
      this.subscribers = [];
    }
  
    publish(eventName, arg) {
      let handlers = this.subscribers[eventName];
      if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
          handlers[i][0](arg);
        }
      }
    }
  
    subscribe(eventName, handler) {
      if (!this.subscribers[eventName]) {
        this.subscribers[eventName] = [];
      }
      const subscriptionId = `#${eventName}--${handler.name}--${Math.random().toString().substring(2, 12)}`;
      this.subscribers[eventName].push([handler, subscriptionId]);
  
      /* return the subscription identifier name */
      return subscriptionId;
    }
  
    unsubscribe(eventName, subscriptionId) {
      if (this.subscribers[eventName]) {
        let handlerIndex = -1;
        this.subscribers[eventName].forEach((handler, index) => {
          if (handler[1] == subscriptionId) {
            handlerIndex = index;
          }
        });
  
        this.subscribers[eventName].splice(handlerIndex, 1);
      }
    }
}
  
const messageBus = new MessageBus();
  
export { messageBus };
  