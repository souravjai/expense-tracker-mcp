import db from "../db.js";

export type Category = {
  id: number;
  name: string;
};

export const getCategory = (name: string): Category | undefined => {
  return db
    .prepare(
      `
      SELECT id, name
      FROM categories
      WHERE LOWER(name) = LOWER(?)
    `,
    )
    .get(name) as Category | undefined;
};

export const createCategory = (name: string): Category => {
  const result = db
    .prepare(
      `
      INSERT INTO categories (name)
      VALUES (?)
    `,
    )
    .run(name);

  return {
    id: Number(result.lastInsertRowid),
    name,
  };
};

export const updateCategory = (id: number, name: string): Category => {
  const result = db
    .prepare(
      `
      UPDATE categories
      SET name = ?
      WHERE id = ?
    `,
    )
    .run(name, id);

  if (result.changes === 0) {
    throw new Error(`Category with id ${id} not found`);
  }

  return {
    id,
    name,
  };
};

export const deleteCategory = (id: number): void => {
  const subcategoryCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM subcategories
      WHERE category_id = ?
    `,
    )
    .get(id) as { count: number };

  if (subcategoryCount.count > 0) {
    throw new Error("Cannot delete category because it has subcategories");
  }

  const result = db
    .prepare(
      `
      DELETE FROM categories
      WHERE id = ?
    `,
    )
    .run(id);

  if (result.changes === 0) {
    throw new Error(`Category with id ${id} not found`);
  }
};

export const getCategoriesWithSubcategories = () => {
  return db
    .prepare(
      `
    SELECT c.name as catergory_name,s.name as subcatergory_name
    FROM categories c
    LEFT JOIN subcategories s
    ON s.category_id = c.id 
    `,
    )
    .all() as { category_name: String; subcategory_name: String }[];
};
