import {
  createCategory,
  getCategory,
} from "../repositories/category.repository.js";

import {
  createSubcategory,
  getSubcategory,
} from "../repositories/subcategory.repository.js";

import { createExpense } from "../repositories/expense.repository.js";
import db from "../db.js";

type AddExpenseParameter = {
  amount: number;
  category: string;
  subcategory: string;
  description?: string;
  date?: string;
};

export const addExpense = db.transaction(
  ({
    amount,
    category,
    subcategory,
    description,
    date,
  }: AddExpenseParameter) => {
    let categoryRecord = getCategory(category) ?? createCategory(category);

    let subcategoryRecord =
      getSubcategory(subcategory, categoryRecord.id) ??
      createSubcategory(subcategory, categoryRecord.id);

    const expenseDate = date ?? new Date().toISOString().split("T")[0];

    // Create expense
    return createExpense({
      amount,
      date: expenseDate,
      subcategoryId: subcategoryRecord.id,
      description: description ?? null,
    });
  },
);
