import mongoose, { Schema, model, models } from "mongoose";
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast((v) => (v === "" ? v : castObjectId(v)));
const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    default: "",
    ref: "Category",
  },
  properties: [{ type: Object }],
});

export const Category = models.Category || model("Category", CategorySchema);
