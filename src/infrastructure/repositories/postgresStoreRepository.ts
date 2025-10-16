import { Store } from "@/core/types";
import { BaseRepository } from "@/domain/core/repositories/baseRepository";
import db from "@/infrastructure/database/postgresql";

export class PostgresStoreRepository implements BaseRepository<Store> {
  private table = "stores";

  async findAll(): Promise<Store[]> {
    const result = await db.query(`SELECT * FROM ${this.table}`);
    return result.rows as Store[];
  }

  async findById(id: number): Promise<Store | null> {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE id = $1`, [
      id,
    ]);
    return result.rows.length ? (result.rows[0] as Store) : null;
  }

  async create(store: Omit<Store, "id">): Promise<Store> {
    const { name, owner, products, verified, location, photo } = store;
    const result = await db.query(
      `INSERT INTO ${this.table} (name, owner, products, verified, location, photo) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, owner, products, verified, location, photo]
    );
    return result.rows[0] as Store;
  }

  async update(id: number, store: Partial<Store>): Promise<Store | null> {
    // Build SET part of query dynamically based on provided fields
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(store).forEach(([key, value]) => {
      if (key !== "id") {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const result = await db.query(
      `UPDATE ${this.table} SET ${updates.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows.length ? (result.rows[0] as Store) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.query(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  }

  async searchStores(query: string): Promise<Store[]> {
    const result = await db.query(
      `SELECT * FROM ${this.table} 
       WHERE name ILIKE $1 OR owner ILIKE $1 OR location ILIKE $1`,
      [`%${query}%`]
    );
    return result.rows as Store[];
  }
}

export const postgresStoreRepository = new PostgresStoreRepository();
