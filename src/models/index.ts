// Export all models from a single index file for better module resolution
export { default as User } from './User';
export { default as Sales } from './Sales';
export { default as Order } from './Order';

// Export types
export type { IUser } from './User';
export type { ISales } from './Sales';
export type { IOrder, IOrderItem } from './Order';