import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import { InvoiceItemModel } from "../repository/invoice-item.model";
import { InvoiceModel } from "../repository/invoice.model";

describe("InvoiceFacade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
      name: "Client 1",
      document: "123456789",
      street: "Street 1",
      number: "100",
      complement: "Apt 10",
      city: "Sao Paulo",
      state: "SP",
      zipCode: "01234-000",
      items: [
        {
          id: "1",
          name: "Item 1",
          price: 100,
        },
        {
          id: "2",
          name: "Item 2",
          price: 50,
        },
      ],
    };

    const output = await facade.generate(input);
    const invoice = await InvoiceModel.findOne({
      where: { id: output.id },
      include: [{ model: InvoiceItemModel }],
    });

    expect(invoice).toBeDefined();
    expect(invoice.name).toBe(input.name);
    expect(invoice.items).toHaveLength(2);
    expect(output.total).toBe(150);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const generatedInvoice = await facade.generate({
      name: "Client 1",
      document: "123456789",
      street: "Street 1",
      number: "100",
      complement: "Apt 10",
      city: "Sao Paulo",
      state: "SP",
      zipCode: "01234-000",
      items: [
        {
          id: "1",
          name: "Item 1",
          price: 100,
        },
      ],
    });

    const output = await facade.find({ id: generatedInvoice.id });

    expect(output.id).toBe(generatedInvoice.id);
    expect(output.name).toBe("Client 1");
    expect(output.address.street).toBe("Street 1");
    expect(output.items).toHaveLength(1);
    expect(output.total).toBe(100);
  });
});
