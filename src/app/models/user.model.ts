import { Address } from "./address.model";

export class User {
  constructor (
    public authId: string,
    public name: string,
    public email: string,
    public phone: string,
    public password: string,
    public admin: boolean,
    public _type?: string,
    public _id?: string,
    public address?: Address,
    public contactForm?: string,
    public lastName?: string,
    public logo?: boolean,
    public advertisements?: Array<string>,
    public favourites?: Array<string>
  ) {}
}
