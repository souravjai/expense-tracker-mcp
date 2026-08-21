import "./db.js";
import { addExpense } from "./services/expense.service.js";

addExpense({
  amount: 500,
  category: "Food",
  subcategory: "grocery",
  description: "Grocery for corn",
  date: "21-08-2026",
});
