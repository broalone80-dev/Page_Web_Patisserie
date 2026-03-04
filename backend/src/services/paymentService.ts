import axios from 'axios';
import { config } from '@config/env';

const FLUTTERWAVE_API_KEY = process.env.FLUTTERWAVE_API_KEY || '';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '';
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '';
const CINETPAY_BASE_URL = 'https://api.cinetpay.com/v1';

export class PaymentService {
  /**
   * Create Flutterwave payment link
   */
  static async createFlutterwavePayment(
    orderId: string,
    amountCents: number,
    email: string,
    fullName: string
  ) {
    const amount = amountCents / 100; // Convert cents to XAF

    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        {
          tx_ref: `ORD-${orderId}`,
          amount,
          currency: 'XAF',
          customer: {
            email,
            name: fullName,
          },
          customizations: {
            title: 'Paiement Patisserie',
            description: `Commande ${orderId}`,
          },
          redirect_url: `${config.server.frontendUrl}/payment/callback?provider=flutterwave&order=${orderId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_API_KEY}`,
          },
        }
      );

      return {
        provider: 'flutterwave',
        paymentLink: response.data.data.link,
        reference: response.data.data.link_id,
      };
    } catch (error: any) {
      console.error('Flutterwave payment creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create Flutterwave payment');
    }
  }

  /**
   * Create CinetPay payment link
   */
  static async createCinetpayPayment(
    orderId: string,
    amountCents: number,
    email: string,
    fullName: string
  ) {
    const amount = amountCents / 100;

    try {
      const response = await axios.post(
        `${CINETPAY_BASE_URL}/payment/create`,
        {
          apikey: CINETPAY_API_KEY,
          site_id: CINETPAY_SITE_ID,
          amount,
          currency: 'XAF',
          transaction_id: `ORD-${orderId}`,
          description: `Commande Patisserie ${orderId}`,
          customer_name: fullName,
          customer_email: email,
          notify_url: `${config.server.apiBaseUrl}/api/payments/webhook/cinetpay`,
          return_url: `${config.server.frontendUrl}/payment/callback?provider=cinetpay&order=${orderId}`,
          channels: 'ALL',
        }
      );

      if (response.data.code === '00') {
        return {
          provider: 'cinetpay',
          paymentLink: response.data.payment_url,
          reference: response.data.payment_token,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('CinetPay payment creation failed:', error.response?.data || error.message);
      throw new Error('Failed to create CinetPay payment');
    }
  }

  /**
   * Verify Flutterwave payment
   */
  static async verifyFlutterwavePayment(transactionId: string) {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_API_KEY}`,
          },
        }
      );

      return {
        status: response.data.data.status, // completed, cancelled, pending
        amount: response.data.data.amount,
        reference: response.data.data.tx_ref,
      };
    } catch (error) {
      console.error('Flutterwave verification failed:', error);
      throw new Error('Failed to verify Flutterwave payment');
    }
  }

  /**
   * Verify CinetPay payment
   */
  static async verifyCinetpayPayment(paymentToken: string) {
    try {
      const response = await axios.post(`${CINETPAY_BASE_URL}/payment/check`, {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        payment_token: paymentToken,
      });

      // CinetPay status: accepted, declined, pending
      return {
        status: response.data.status === 'accepted' ? 'completed' : response.data.status,
        amount: response.data.amount,
        reference: response.data.payment_id,
      };
    } catch (error) {
      console.error('CinetPay verification failed:', error);
      throw new Error('Failed to verify CinetPay payment');
    }
  }
}
