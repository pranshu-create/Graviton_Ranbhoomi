import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["HARDWARE", "MARKETING", "PRIZES", "LOGISTICS", "OTHER"], default: "OTHER" },
  addedBy: { type: String, required: true }, // Admin email who logged it
}, { timestamps: true });

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

export default mongoose.model("Expense", ExpenseSchema);
