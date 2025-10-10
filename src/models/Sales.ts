import mongoose, { Document, Schema } from 'mongoose';

export interface ISales extends Document {
  _id: string;
  orderId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  salesPerson: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  region: string;
  country: string;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalesSchema: Schema = new Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  productCategory: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Automotive', 'Other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  salesPerson: {
    type: String,
    required: [true, 'Sales person is required'],
    trim: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash']
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  saleDate: {
    type: Date,
    required: [true, 'Sale date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware to calculate total amount before saving
SalesSchema.pre('save', function(this: ISales, next) {
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

// Create indexes for better query performance
SalesSchema.index({ saleDate: -1 });
SalesSchema.index({ productCategory: 1 });
SalesSchema.index({ paymentStatus: 1 });
SalesSchema.index({ region: 1 });
SalesSchema.index({ customerEmail: 1 });
SalesSchema.index({ orderId: 1 });

export default mongoose.models.Sales || mongoose.model<ISales>('Sales', SalesSchema);