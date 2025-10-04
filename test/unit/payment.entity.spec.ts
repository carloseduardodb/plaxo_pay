import { Payment, PaymentStatus, PaymentMethod } from '@/domain/entities/payment.entity';
import { Money } from '@/domain/value-objects/money.vo';

describe('Payment Entity', () => {
  let payment: Payment;

  beforeEach(() => {
    payment = new Payment(
      'payment-id',
      'app-id',
      'external-id',
      new Money(100, 'BRL'),
      PaymentMethod.PIX,
      PaymentStatus.PENDING,
      'Test payment'
    );
  });

  describe('approve', () => {
    it('should change status to approved', () => {
      const approvedPayment = payment.approve();
      
      expect(approvedPayment.status).toBe(PaymentStatus.APPROVED);
      expect(approvedPayment.id).toBe(payment.id);
      expect(approvedPayment.amount).toBe(payment.amount);
    });
  });

  describe('reject', () => {
    it('should change status to rejected', () => {
      const rejectedPayment = payment.reject();
      
      expect(rejectedPayment.status).toBe(PaymentStatus.REJECTED);
    });
  });

  describe('cancel', () => {
    it('should cancel pending payment', () => {
      const cancelledPayment = payment.cancel();
      
      expect(cancelledPayment.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should throw error when cancelling non-pending payment', () => {
      const approvedPayment = payment.approve();
      
      expect(() => approvedPayment.cancel()).toThrow('Only pending payments can be cancelled');
    });
  });
});