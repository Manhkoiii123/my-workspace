import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductTcpRequest } from '@common/interfaces/tcp/product';
@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}
  async create(body: CreateProductTcpRequest) {
    const { sku, name } = body;
    // check if product with same sku already exists
    const existingProduct = await this.productRepository.exists(sku, name);
    if (existingProduct) {
      throw new BadRequestException(
        'Product with the same SKU or name already exists'
      );
    }
    return this.productRepository.create(body);
  }
  async getList() {
    return this.productRepository.findAll();
  }
}
