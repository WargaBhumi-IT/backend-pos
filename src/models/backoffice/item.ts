import { Schema, model } from "mongoose";


export interface IItem {
    fullname: string;
}

export const ItemSchema = new Schema<IItem>({
    fullname: {
        type: String,
        required: true
    }
});

export const ItemModel = model<IItem>("backoffice.item", ItemSchema);