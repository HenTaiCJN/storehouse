class EventBus {
    constructor() {
        this.subscribers = {};
    }

    subscribe(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);

        // 返回取消订阅的函数
        return () => {
            const index = this.subscribers[eventName].indexOf(callback);
            if (index !== -1) {
                this.subscribers[eventName].splice(index, 1);
            }
        };
    }

    publish(eventName, data) {
        const subscribers = this.subscribers[eventName];
        if (subscribers) {
            subscribers.forEach(callback => {
                callback(data);
            });
        }
    }
}

const eventBus = new EventBus();
export default eventBus;