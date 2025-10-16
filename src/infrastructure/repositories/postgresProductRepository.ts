
import { Product } from '@/core/types';
import { BaseRepository } from '@/domain/core/repositories/baseRepository';
import db from '@/infrastructure/database/postgresql';

export class PostgresProductRepository implements BaseRepository<Product> {
  private table = 'products';

  async findAll(): Promise<Product[]> {
    const result = await db.query(`SELECT * FROM ${this.table}`);
    return result.rows as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    return result.rows.length ? result.rows[0] as Product : null;
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { title, price, image, storeName, isNew, isFeatured, isSoldOut } = product;
    const result = await db.query(
      `INSERT INTO ${this.table} (title, price, image, store_name, is_new, is_featured, is_sold_out) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, price, image, storeName, isNew, isFeatured, isSoldOut]
    );
    return result.rows[0] as Product;
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(product).forEach(([key, value]) => {
      if (key !== 'id') {
        // Convert camelCase to snake_case for DB columns
        const columnName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updates.push(`${columnName} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const result = await db.query(
      `UPDATE ${this.table} SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows.length ? result.rows[0] as Product : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.query(`DELETE FROM ${this.table} WHERE id = $1 RETURNING id`, [id]);
    return result.rows.length > 0;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE is_featured = true`);
    return result.rows as Product[];
  }
}

export const postgresProductRepository = new PostgresProductRepository();
