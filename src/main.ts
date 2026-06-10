import { Sequelize } from "sequelize-typescript";
import app from "./api/express";
import { ClientModel } from "./modules/client-adm/repository/client.model";
import { ProductModel } from "./modules/product-adm/repository/product.model";
import { InvoiceModel } from "./modules/invoice/repository/invoice.model";
import { InvoiceItemModel } from "./modules/invoice/repository/invoice-item.model";
import TransactionModel from "./modules/payment/repository/transaction.model";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_PATH || ":memory:",
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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
