import { Module } from '@nestjs/common';
import { PdfModule } from '../pdf/pdf.module';
import { InvoicePdfController } from './controllers/invoice-pdf.controller';
import { InvoicePdfService } from './services/invoice-pdf.service';
import { PdfService } from '../pdf/services/pdf.service';

@Module({
  imports: [],
  controllers: [InvoicePdfController],
  providers: [InvoicePdfService],
  exports: [PdfService],
})
export class InvoiceModule {}
