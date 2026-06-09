import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import InvoiceFacadeInterface from "./invoice.facade.interface";

export interface UseCaseProps {
  findUsecase: UseCaseInterface;
  generateUsecase: UseCaseInterface;
}

export default class InvoiceFacade implements InvoiceFacadeInterface {
  private _findUsecase: UseCaseInterface;
  private _generateUsecase: UseCaseInterface;

  constructor(usecaseProps: UseCaseProps) {
    this._findUsecase = usecaseProps.findUsecase;
    this._generateUsecase = usecaseProps.generateUsecase;
  }

  async find(input: { id: string }): Promise<any> {
    return this._findUsecase.execute(input);
  }

  async generate(input: any): Promise<any> {
    return this._generateUsecase.execute(input);
  }
}
