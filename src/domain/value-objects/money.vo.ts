import { DomainException } from '../exceptions/domain.exception';

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'BRL'
  ) {
    if (amount < 0) {
      throw new DomainException('Amount cannot be negative');
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainException('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}