import { Schema, model } from "mongoose";


export interface IContact {
    name: string;
    type: string;
    value: string;
    hidden_in_general: boolean;
}

export const ContactSchema = new Schema<IContact>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [ "office_email", "office_phone_number", "personal_email", "personal_phone_number" ]
    },
    value: {
        type: String,
        required: true
    },
    hidden_in_general: {
        type: Boolean,
        required: true,
        default: false
    }
});

export const ContactModel = model<IContact>("backoffice.contact", ContactSchema);

export class Contact {
    private _id: string;
    private _name: string;
    private _type: string;
    private _value: string;
    private _hidden_in_general: boolean;

    private constructor(id: string, name: string, type: string, value: string, hidden_in_general: boolean){
        this._id = id;
        this._name = name;
        this._type = type;
        this._value = value;
        this._hidden_in_general = hidden_in_general;
    }

    public get id() { return this._id }
    public get name() { return this._name }
    public get type() { return this._type }
    public get value() { return this._value }
    public get hidden_in_general() { return this._hidden_in_general }

    public static async getById(id: string) {
        const c = await ContactModel.findById(id);
        if(!c) throw new Error(`Contact with id ${id} not found`);

        return new Contact(
            c._id.toString(),
            c.name,
            c.type,
            c.value,
            c.hidden_in_general,
        );
    }

    public static async create(name: string, type: string, value: string, hidden_in_general: boolean = true) {
        const c = await (new ContactModel({name, type, value, hidden_in_general}).save());
 
        return new Contact(
            c._id.toString(),
            c.name,
            c.type,
            c.value,
            c.hidden_in_general,
        );
    }
}

export default Contact;