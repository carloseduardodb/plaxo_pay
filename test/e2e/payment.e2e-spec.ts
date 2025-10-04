import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PaymentMethod } from "@/domain/entities/payment.entity";
import { setupTestApp, closeTestApp } from "./test-setup";

describe("PaymentController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let testApplicationId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        username: "admin",
        password: "admin123",
      });
    authToken = loginResponse.body.access_token;
    const appResponse = await request(app.getHttpServer())
      .post("/applications")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Application",
        apiKey: "test-api-key-123",
      });
    testApplicationId = appResponse.body.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe("/payments (POST)", () => {
    it("should create a new payment", () => {
      const createPaymentDto = {
        applicationId: testApplicationId,
        amount: 100,
        currency: "BRL",
        method: PaymentMethod.PIX,
        description: "Test payment",
        customerId: "customer-123",
      };

      return request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createPaymentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.applicationId).toBe(createPaymentDto.applicationId);
          expect(res.body.amount.amount).toBe(createPaymentDto.amount);
          expect(res.body.method).toBe(createPaymentDto.method);
        });
    });

    it("should return 400 for invalid payment data", () => {
      const invalidPaymentDto = {
        applicationId: testApplicationId,
        amount: -10, // Invalid negative amount
        method: PaymentMethod.PIX,
        currency: "BRL",
      };

      return request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidPaymentDto)
        .expect(400);
    });
  });

  describe("/payments/:id (GET)", () => {
    it("should return payment by id", async () => {
      // First create a payment
      const createPaymentDto = {
        applicationId: testApplicationId,
        amount: 50,
        currency: "BRL",
        method: PaymentMethod.PIX,
        description: "Test payment for retrieval",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createPaymentDto)
        .expect(201);

      const paymentId = createResponse.body.id;

      // Then retrieve it
      return request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(paymentId);
          expect(res.body.applicationId).toBe(createPaymentDto.applicationId);
        });
    });

    it("should return 404 for non-existent payment", () => {
      return request(app.getHttpServer())
        .get("/payments/550e8400-e29b-41d4-a716-446655440001")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
