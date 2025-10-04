export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly applicationId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: string
  ) {}
}

export class PaymentApprovedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly applicationId: string,
    public readonly subscriptionId?: string
  ) {}
}

export class PaymentRejectedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly applicationId: string,
    public readonly reason?: string
  ) {}
}