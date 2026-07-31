type Handler<T = unknown> = (evt: T) => void;
interface EventBusOptions<Events extends Record<string, unknown> = Record<string, unknown>> {
    on<K extends keyof Events>(type: K, handler: Handler<Events[K]>): EventBusOptions<Events>;
    off<K extends keyof Events>(type: K, handler: Handler<Events[K]>): EventBusOptions<Events>;
    emit<K extends keyof Events>(type: K, ...evt: undefined extends Events[K] ? [evt?: Events[K]] : [evt: Events[K]]): void;
    clear(): void;
}
declare function EventBus<Events extends Record<string, unknown> = Record<string, unknown>>(): EventBusOptions<Events>;

export { EventBus, type EventBusOptions, type Handler };
