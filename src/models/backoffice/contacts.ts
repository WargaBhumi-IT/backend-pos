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

class Contact {
    id: string;
    name: string;
    type: string;
    value: string;
    hidden_in_general: boolean;

    private constructor(
        id: string,
        name: string,
        type: string,
        value: string,
        hidden_in_general: boolean
    ){
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
        this.hidden_in_general = hidden_in_general;
    }

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

    public static async new(
        name: string,
        type: string,
        value: string,
        hidden_in_general: boolean
    ) {
        const c = await (new ContactModel({
            name,
            type,
            value,
            hidden_in_general
        }).save());

        return new Contact(
            c._id.toString(),
            c.name,
            c.type,
            c.value,
            c.hidden_in_general,
        );
    }
}