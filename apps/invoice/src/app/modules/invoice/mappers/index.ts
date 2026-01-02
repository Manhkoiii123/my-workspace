import { CreateCheckoutSessionRequest } from '@common/interfaces/common/stripe.interface';
import { CreateInvoiceTcpRequest } from '@common/interfaces/tcp/invoice';
import { Invoice } from '@common/schemas/invoice.schema';

export const invoiceRequestMapping = (
  data: CreateInvoiceTcpRequest
): Partial<Invoice> => {
  return {
    // data đang có items và client
    ...data,
    totalAmount: data.items.reduce((acc, item) => acc + item.total, 0),
    vatAmount: data.items.reduce(
      (acc, item) =>
        acc + item.unitPrice * item.quantity * (item.vatRate / 100),
      0
    ),
  };
};
export const createCheckoutSessionMapping = (
  invoice: Invoice
): CreateCheckoutSessionRequest => {
  return {
    invoiceId: invoice._id.toString(),
    clientEmail: invoice.client.email,
    lineItems: invoice.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.total,
    })),
  };
};
