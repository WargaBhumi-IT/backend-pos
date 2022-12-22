import { Schema, model } from "mongoose";
import Contact from "./contacts";


export interface ICustomer {
    fullname: string;
    description: string;
    contacts: Array<string>;
}

export const CustomerSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ""
    },
    contacts: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "backoffice.contact"
    }
});

export const CustomerModel = model<ICustomer>("backoffice.customer", CustomerSchema);

export class Customer {
    private _id : string;
    private _fullname: string;
    private _description: string;
    private _contacts: Array<Contact>;

    private constructor(id: string, fullname: string, description: string, contacts: Array<Contact>) {
        this._id = id;
        this._fullname = fullname;
        this._description = description;
        this._contacts = contacts;
    }

    public get id() { return this._id }
    public get fullname() { return this._fullname }
    public get description() { return this._description }
    public get contacts() { return this._contacts }

    public static async getById(id: string) {
        const c = await CustomerModel.findById(id);
        if(!c) throw new Error(`customer by id ${id} not found`);

        const cs = new Array<Contact>();
        for(const id of c.contacts) {
            cs.push(await Contact.getById(id));
        }
        return new Customer(c._id.toString(), c.fullname, c.description, cs);
    }
}

export default Customer;