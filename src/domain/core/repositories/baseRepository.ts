
export interface BaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string | number, item: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}
