import { Address } from "./address.model";

export class Advertisement {
  constructor (
    public isCompany: boolean,
    public published: boolean,
    public address: Address,
    public images: Array<string>,
    public type: string,
    public furnished: boolean,
    public lastModified: Date,
    public author: string,
    public price: number,
    public deposit: number,
    public description: string,
    public size: number,
    public rooms: number,
    public toilets: number,
    public energeticCert: string,
    public contractClauses: string,
    public otherServices?: Array<string>,
    public inventory?: string,
    public _id?: string
    ) {}
  }
  