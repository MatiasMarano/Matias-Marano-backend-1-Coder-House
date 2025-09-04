import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  products: { type: [itemSchema], default: [] }
}, { timestamps: true });

export const CartModel = mongoose.model('Cart', cartSchema);
