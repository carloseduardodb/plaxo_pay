export class SubscriptionCreatedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly applicationId: string,
    public readonly customerId: string,
    public readonly planName: string,
    public readonly amount: number
  ) {}
}

export class SubscriptionCancelledEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly applicationId: string,
    public readonly customerId: string
  ) {}
}

export class SubscriptionRenewalDueEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly applicationId: string,
    public readonly customerId: string,
    public readonly dueDate: Date
  ) {}
}