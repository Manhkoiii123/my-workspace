import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSessionRequest } from '@common/interfaces/common/stripe.interface';
import { url } from 'inspector';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createCheckoutSession(params: CreateCheckoutSessionRequest) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: this.configService.get('STRIPE_CONFIG.SUCCESS_URL'),
      cancel_url: this.configService.get('STRIPE_CONFIG.CANCEL_URL'),
      line_items: params.lineItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      customer_email: params.clientEmail,
      metadata: {
        invoiceId: params.invoiceId,
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }
}
