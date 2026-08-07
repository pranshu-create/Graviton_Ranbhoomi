import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Expense from "@/models/Expense";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

export async function GET() {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, amount, category, addedBy } = body;

    if (!title || !amount || !addedBy) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newExpense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || "OTHER",
      addedBy
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
