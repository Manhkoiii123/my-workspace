import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  renderEjsTemplate(templatePath: string, data: any) {
    const fullPath = path.resolve(templatePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Template file does not exist');
    }
    return ejs.renderFile(fullPath, data);
  }
  async generatePdfFromEjs(templatePath: string, data: any) {
    const html = await this.renderEjsTemplate(templatePath, data);
    return html;
  }
}
