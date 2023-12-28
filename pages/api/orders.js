import { mongooseConnect } from "../../lib/mongoose";
import { Order } from "../../models/Order";

export default async function handler(req, res) {
  console.log("here");
  if (req.method == "GET") {
    await mongooseConnect();
    res.json(await Order.find({}).sort({ createdAt: -1 }));
  }
}
