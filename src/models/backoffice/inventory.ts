import { Schema, model } from "mongoose";


export interface IInventory {
    item: string;
    value: number;
}

export const InventorySchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "backoffice.item"
    },
    value: {
        type: Number,
        required: true,
        default: 0
    }
});

export const InventoryModel = model<IInventory>("backoffice.inventory", InventorySchema);