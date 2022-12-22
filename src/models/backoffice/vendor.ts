import { Schema, model } from "mongoose";
import { IContact } from "./contacts";

export interface IVendor {
    fullname: string;
    contacts: Array<IContact>;
    offerings: Array<string>;   // Id of backoffice.item
    descriptions: string;
}

export const VendorSchema = new Schema<IVendor>({
    
})