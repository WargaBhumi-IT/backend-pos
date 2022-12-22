import { Schema, model } from "mongoose";
import Contact from "./contacts";
import Item from "./item";

export interface IVendor {
    fullname: string;
    description: string;
    contacts: Array<string>;
    offerings: Array<string>;   // Id of backoffice.item
}

export const VendorSchema = new Schema({
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
        type: [Schema.Types.ObjectId],
        required: true,
        default: []
    },
    offerings: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: []
    },
});

export const VendorModel = model<IVendor>("backoffice.vendor", VendorSchema);

export class Vendor {
    private _id: string;
    private _fullname: string;
    private _contact: Array<Contact>;
    private _offerings: Array<Item>;
    private _description: string;

    private constructor(id: string, fullname: string, contact: Array<Contact>, offerings: Array<Item>, description: string) {
        this._id = id;
        this._fullname = fullname;
        this._contact = contact;
        this._offerings = offerings;
        this._description = description;
    }

    public get id() { return this._id }
    public get fullname() { return this._fullname }
    public get contact() { return this._contact }
    public get offerings() { return this._offerings }
    public get description() { return this._description }

    public static async getById(id: string) {
        const v = await VendorModel.findById(id);
        if(!v) throw new Error(`Vendor by ${id} not found`);

        const contacts = new Array<Contact>();
        for(const __id of v.contacts) {
            contacts.push(await Contact.getById(__id));
        }

        const offerings = new Array<Item>();
        for(const __id of v.offerings) {
            offerings.push(await Item.getById(__id));
        }

        return new Vendor(
            v._id.toString(),
            v.fullname,
            contacts,
            offerings,
            v.description
        )
    }
}

export default Vendor;