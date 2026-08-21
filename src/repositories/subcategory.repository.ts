import db from "../db.js";

export type Subcategory = {
  id: number;
  categoryId: number;
  name: string;
};

export const getSubcategory = (
  name: string,
  categoryId: number,
): Subcategory | undefined => {
  return db
    .prepare(
      `
      SELECT id, category_id as categoryId, name
      FROM subcategories
      WHERE category_id = ?
        AND LOWER(name) = LOWER(?)
    `,
    )
    .get(categoryId, name) as Subcategory | undefined;
};

export const createSubcategory = (
  name: string,
  categoryId: number,
): Subcategory => {
  const result = db
    .prepare(
      `
      INSERT INTO subcategories (category_id, name)
      VALUES (?, ?)
    `,
    )
    .run(categoryId, name);

  return {
    id: Number(result.lastInsertRowid),
    categoryId,
    name,
  };
};

export const updateSubcategory = (id: number, name: string): Subcategory => {
  const result = db
    .prepare(
      `
      UPDATE subcategories
      SET name = ?
      WHERE id = ?
    `,
    )
    .run(name, id);

  if (result.changes === 0) {
    throw new Error(`Subcategory with id ${id} not found`);
  }

  const subcategory = db
    .prepare(
      `
      SELECT id, category_id as categoryId, name
      FROM subcategories
      WHERE id = ?
    `,
    )
    .get(id) as Subcategory | undefined;

  if (!subcategory) {
    throw new Error(`Subcategory with id ${id} not found`);
  }

  return subcategory;
};

export const deleteSubcategory = (id: number): void => {
  const expenseCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM expenses
      WHERE subcategory_id = ?
    `,
    )
    .get(id) as { count: number };

  if (expenseCount.count > 0) {
    throw new Error("Cannot delete subcategory because it has expenses");
  }

  const result = db
    .prepare(
      `
      DELETE FROM subcategories
      WHERE id = ?
    `,
    )
    .run(id);

  if (result.changes === 0) {
    throw new Error(`Subcategory with id ${id} not found`);
  }
};
