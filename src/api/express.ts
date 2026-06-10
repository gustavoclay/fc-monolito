import express, { Express, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import ClientAdmFacadeFactory from "../modules/client-adm/factory/client-adm.facade.factory";
import ProductAdmFacadeFactory from "../modules/product-adm/factory/facade.factory";
import PaymentFacadeFactory from "../modules/payment/factory/payment.facade.factory";
import InvoiceFacadeFactory from "../modules/invoice/factory/invoice.facade.factory";
import Address from "../modules/@shared/domain/value-object/address";

export const app: Express = express();

// Middlewares
app.use(express.json());

// Factories
const clientAdmFacade = ClientAdmFacadeFactory.create();
const productAdmFacade = ProductAdmFacadeFactory.create();
const paymentFacade = PaymentFacadeFactory.create();
const invoiceFacade = InvoiceFacadeFactory.create();

// ========== PRODUCTS ==========
app.post("/products", async (req: Request, res: Response) => {
  try {
    const { id, name, description, purchasePrice, stock } = req.body;

    const productId = id || uuid();

    await productAdmFacade.addProduct({
      id: productId,
      name,
      description,
      purchasePrice,
      stock,
    });

    res.status(201).json({
      id: productId,
      name,
      description,
      purchasePrice,
      stock,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ========== CLIENTS ==========
app.post("/clients", async (req: Request, res: Response) => {
  try {
    const { id, name, email, document, address } = req.body;

    const clientId = id || uuid();

    const addressObj = new Address(
      address.street,
      address.number,
      address.complement || "",
      address.city,
      address.state,
      address.zipCode
    );

    await clientAdmFacade.add({
      id: clientId,
      name,
      email,
      document,
      address: addressObj,
    });

    res.status(201).json({
      id: clientId,
      name,
      email,
      document,
      address: {
        street: addressObj.street,
        number: addressObj.number,
        complement: addressObj.complement,
        city: addressObj.city,
        state: addressObj.state,
        zipCode: addressObj.zipCode,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ========== CHECKOUT ==========
app.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { clientId, products } = req.body;

    // Validate client
    const client = await clientAdmFacade.find({ id: clientId });

    // Validate and calculate total
    let total = 0;
    const items: Array<{
      id: string;
      name: string;
      price: number;
    }> = [];

    for (const product of products) {
      const catalogProduct = await productAdmFacade.checkStock({
        productId: product.productId,
      });

      if (catalogProduct.stock < product.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product ${product.productId}`,
        });
      }

      items.push({
        id: product.productId,
        name: product.name,
        price: product.salesPrice,
      });

      total += product.salesPrice * product.quantity;
    }

    // Process payment
    const orderId = uuid();
    const payment = await paymentFacade.process({
      orderId,
      amount: total,
    });

    // Generate invoice
    const invoice = await invoiceFacade.generate({
      name: client.name,
      document: client.document,
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement,
      city: client.address.city,
      state: client.address.state,
      zipCode: client.address.zipCode,
      items,
    });

    res.status(201).json({
      invoiceId: invoice.id,
      status: payment.status,
      total,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ========== INVOICE ==========
app.get("/invoice/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceFacade.find({ id });

    res.status(200).json({
      id: invoice.id,
      name: invoice.name,
      document: invoice.document,
      address: invoice.address,
      items: invoice.items,
      total: invoice.total,
      createdAt: invoice.createdAt,
    });
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "Invoice not found",
    });
  }
});

export default app;
