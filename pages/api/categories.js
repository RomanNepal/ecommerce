import { getServerSession } from "next-auth";
import { mongooseConnect } from "../../lib/mongoose";
import { Category } from "../../models/Category";
import { authOptions, isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;

  await mongooseConnect();
  await isAdminRequest(req, res);
  if (method === "GET") {
    res.json(await Category.find().populate("parent"));
  }

  if (method === "POST") {
    const { name, parent, properties } = req.body;
    console.log(properties);
    const categoryDoc = await Category.create({ name, parent, properties });
    res.json(categoryDoc);
  }

  if (method === "PUT") {
    const { name, parent, _id, properties } = req.body;

    const categoryDoc = await Category.updateOne(
      { _id },
      { name, parent, properties }
    );
    res.json(categoryDoc);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    const result = await Category.deleteOne({ _id });
    res.json(result);
  }
}
