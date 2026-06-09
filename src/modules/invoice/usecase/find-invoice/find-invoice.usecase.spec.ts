import { Sequelize } from "sequelize-typescript";
import { InvoiceItemModel } from "../../repository/invoice-item.model";
import { InvoiceModel } from "../../repository/invoice.model";
import InvoiceRepository from "../../repository/invoice.repository";
import FindInvoiceUseCase from "./find-invoice.usecase";

describe("FindInvoiceUseCase test", () => {
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

  it("should find an invoice", async () => {
    await InvoiceModel.create(
      {
        id: "1",
        name: "Client 1",
        document: "123456789",
        street: "Street 1",
        number: "100",
        complement: "Apt 10",
        city: "Sao Paulo",
        state: "SP",
        zipcode: "01234-000",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "1",
            invoiceId: "1",
            name: "Item 1",
            price: 100,
          },
          {
            id: "2",
            invoiceId: "1",
            name: "Item 2",
            price: 50,
          },
        ],
      },
      {
        include: [{ model: InvoiceItemModel }],
      }
    );

    const repository = new InvoiceRepository();
    const usecase = new FindInvoiceUseCase(repository);

    const output = await usecase.execute({ id: "1" });

    expect(output.id).toBe("1");
    expect(output.name).toBe("Client 1");
    expect(output.document).toBe("123456789");
    expect(output.address.street).toBe("Street 1");
    expect(output.address.number).toBe("100");
    expect(output.address.complement).toBe("Apt 10");
    expect(output.address.city).toBe("Sao Paulo");
    expect(output.address.state).toBe("SP");
    expect(output.address.zipCode).toBe("01234-000");
    expect(output.items).toHaveLength(2);
    expect(output.items[0].name).toBe("Item 1");
    expect(output.total).toBe(150);
    expect(output.createdAt).toBeInstanceOf(Date);
  });
});
