import { BaseSchema, createSchema } from './base.schema';
import { Prop, Schema } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INVOICE_STATUS } from '@common/constants/enum/invoice.enum';
class Client {
  @Prop({ type: String })
  name: string;
  @Prop({ type: String })
  email: string;
  @Prop({ type: String })
  address: string;
}

// lưu lại cái này vì khi chỉnh sửa thì nó sẽ mất ko lấy được giá cũ nữa => lưu lại để truy xuất đúng hơn
class Item {
  @Prop({ type: String })
  productId: string;
  @Prop({ type: String })
  name: string;
  @Prop({ type: Number })
  quantity: number;
  @Prop({ type: Number })
  unitPrice: number;
  @Prop({ type: Number })
  vatRate: number;
  @Prop({ type: Number })
  total: number;
}

@Schema({
  collection: 'invoice',
})
export class Invoice extends BaseSchema {
  @Prop({ type: Client })
  client: Client;

  totalAmount: number;

  vatAmount: number;

  @Prop({ type: String, enum: INVOICE_STATUS, default: INVOICE_STATUS.CREATED })
  status: INVOICE_STATUS;

  @Prop({ type: [Item] })
  items: Item[];

  @Prop({ type: String, required: false })
  supervisorId?: string;

  @Prop({ type: String, required: false })
  fileUrl?: string;
}
export const InvoiceSchema = createSchema(Invoice);

export const InvoiceModelName = Invoice.name;
export const InvoiceDestination = {
  name: InvoiceModelName,
  schema: InvoiceSchema,
};
export type InvoiceModel = Model<Invoice>;
