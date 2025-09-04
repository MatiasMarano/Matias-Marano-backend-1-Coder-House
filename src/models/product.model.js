import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true, min: 0, index: true },
  stock: { type: Number, required: true, min: 0 },
  category: { type: String, index: true },
  status: { type: Boolean, default: true, index: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

export const ProductModel = mongoose.model('Product', productSchema);
