export type Nullable<T> = T | undefined | null;

export type WithRequired<T, K extends keyof T> = Partial<T> & {
  [P in K]-?: T[P];
};
