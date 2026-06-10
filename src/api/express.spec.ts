import request from "supertest";
import { Sequelize } from "sequelize-typescript";
import { app } from "./express";
import { ClientModel } from "../modules/client-adm/repository/client.model";
import { ProductModel } from "../modules/product-adm/repository/product.model";
import { InvoiceModel } from "../modules/invoice/repository/invoice.model";
import { InvoiceItemModel } from "../modules/invoice/repository/invoice-item.model";
import TransactionModel from "../modules/payment/repository/transaction.model";

describe("E2E API Tests", () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      ClientModel,
      ProductModel,
      InvoiceModel,
      InvoiceItemModel,
      TransactionModel,
    ]);

    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /products", () => {
    it("should create a product", async () => {
      const response = await request(app)
        .post("/products")
        .send({
          name: "Product 1",
          description: "Description 1",
          purchasePrice: 100,
          stock: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Product 1");
      expect(response.body.description).toBe("Description 1");
      expect(response.body.purchasePrice).toBe(100);
      expect(response.body.stock).toBe(10);
    });

    it("should create a product with custom id", async () => {
      const response = await request(app)
        .post("/products")
        .send({
          id: "custom-product-id",
          name: "Product 2",
          description: "Description 2",
          purchasePrice: 50,
          stock: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("custom-product-id");
      expect(response.body.name).toBe("Product 2");
    });
  });

  describe("POST /clients", () => {
    it("should create a client", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          name: "John Doe",
          email: "john@example.com",
          document: "12345678901",
          address: {
            street: "Rua 123",
            number: "99",
            complement: "Casa",
            city: "Criciúma",
            state: "SC",
            zipCode: "88888-888",
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("John Doe");
      expect(response.body.email).toBe("john@example.com");
      expect(response.body.document).toBe("12345678901");
      expect(response.body.address.street).toBe("Rua 123");
    });

    it("should create a client with custom id", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          id: "custom-client-id",
          name: "Jane Doe",
          email: "jane@example.com",
          document: "98765432101",
          address: {
            street: "Rua 456",
            number: "100",
            complement: "Apt 1",
            city: "São Paulo",
            state: "SP",
            zipCode: "01000-000",
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("custom-client-id");
      expect(response.body.name).toBe("Jane Doe");
    });

    it("should fail when creating client without required fields", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          name: "Incomplete Client",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /checkout", () => {
    let productId: string;
    let clientId: string;

    beforeEach(async () => {
      // Create a product
      const productResponse = await request(app)
        .post("/products")
        .send({
          name: "Checkout Product",
          description: "Product for checkout",
          purchasePrice: 50,
          stock: 5,
        });
      productId = productResponse.body.id;

      // Create a client
      const clientResponse = await request(app)
        .post("/clients")
        .send({
          name: "Checkout Client",
          email: "checkout@example.com",
          document: "11111111111",
          address: {
            street: "Rua 789",
            number: "200",
            complement: "Apt 2",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "20000-000",
          },
        });
      clientId = clientResponse.body.id;
    });

    it("should complete a checkout", async () => {
      const response = await request(app)
        .post("/checkout")
        .send({
          clientId,
          products: [
            {
              productId,
              name: "Checkout Product",
              description: "Product for checkout",
              salesPrice: 100,
              quantity: 2,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("invoiceId");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("total");
      expect(response.body.total).toBe(200); // 100 * 2
    });

    it("should fail checkout with insufficient stock", async () => {
      const response = await request(app)
        .post("/checkout")
        .send({
          clientId,
          products: [
            {
              productId,
              name: "Checkout Product",
              description: "Product for checkout",
              salesPrice: 100,
              quantity: 100, // More than available stock
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Insufficient stock");
    });

    it("should fail checkout with invalid client", async () => {
      const response = await request(app)
        .post("/checkout")
        .send({
          clientId: "invalid-client-id",
          products: [
            {
              productId,
              name: "Checkout Product",
              description: "Product for checkout",
              salesPrice: 100,
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /invoice/:id", () => {
    let invoiceId: string;

    beforeEach(async () => {
      // Create a product
      const productResponse = await request(app)
        .post("/products")
        .send({
          name: "Invoice Product",
          description: "Product for invoice",
          purchasePrice: 50,
          stock: 10,
        });
      const productId = productResponse.body.id;

      // Create a client
      const clientResponse = await request(app)
        .post("/clients")
        .send({
          name: "Invoice Client",
          email: "invoice@example.com",
          document: "55555555555",
          address: {
            street: "Rua Invoice",
            number: "300",
            complement: "Apt 3",
            city: "Brasília",
            state: "DF",
            zipCode: "70000-000",
          },
        });
      const clientId = clientResponse.body.id;

      // Create a checkout to generate invoice
      const checkoutResponse = await request(app)
        .post("/checkout")
        .send({
          clientId,
          products: [
            {
              productId,
              name: "Invoice Product",
              description: "Product for invoice",
              salesPrice: 150,
              quantity: 1,
            },
          ],
        });

      invoiceId = checkoutResponse.body.invoiceId;
    });

    it("should retrieve an invoice", async () => {
      const response = await request(app).get(`/invoice/${invoiceId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("document");
      expect(response.body).toHaveProperty("address");
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("total");
    });

    it("should fail to retrieve non-existent invoice", async () => {
      const response = await request(app).get("/invoice/non-existent-id");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });
});
