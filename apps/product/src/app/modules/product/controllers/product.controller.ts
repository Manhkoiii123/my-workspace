import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { ProductService } from '../services/product.service';
import { MessagePattern } from '@nestjs/microservices';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message.enum';
import {
  CreateProductTcpRequest,
  ProductTcpResponse,
} from '@common/interfaces/tcp/product';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { RequestParam } from '@common/decorators/request-param.decorator';
@Controller('')
@UseInterceptors(TcpLoggingInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.PRODUCT.CREATE)
  async createProduct(
    @RequestParam() body: CreateProductTcpRequest
  ): Promise<Response<ProductTcpResponse>> {
    const result = await this.productService.create(body);
    return Response.success<ProductTcpResponse>(result);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.PRODUCT.GET_LIST)
  async getList(): Promise<Response<ProductTcpResponse[]>> {
    const result = await this.productService.getList();
    return Response.success<ProductTcpResponse[]>(result);
  }
}
