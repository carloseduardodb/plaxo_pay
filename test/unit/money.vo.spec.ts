import { Money } from '@/domain/value-objects/money.vo';

describe('Money Value Object', () => {
  describe('constructor', () => {
    it('should create money with valid amount', () => {
      const money = new Money(100, 'BRL');
      
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('BRL');
    });

    it('should use BRL as default currency', () => {
      const money = new Money(50);
      
      expect(money.currency).toBe('BRL');
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-10)).toThrow('Amount cannot be negative');
    });
  });

  describe('equals', () => {
    it('should return true for equal money objects', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(100, 'BRL');
      
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(200, 'BRL');
      
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(100, 'USD');
      
      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add money with same currency', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'BRL');
      
      const result = money1.add(money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('BRL');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');
      
      expect(() => money1.add(money2)).toThrow('Cannot add different currencies');
    });
  });
});