import { Schema, model } from "mongoose";
import { InventoryModel } from "./inventory";


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

export class Item {
    private _id: string;
    private _fullname: string;
    private _balance: number;

    private constructor(id: string, fullname: string, balance: number) {
        this._id = id;
        this._fullname = fullname;
        this._balance = balance;
    }

    public get id() { return this._id }
    public get fullname() { return this._fullname }
    public get balance() { return this._balance }

    public static async getById(id: string) {
        const i = await ItemModel.findById(id);
        if(!i) throw new Error(`Item by id ${i} not found`);

        let balance = 0;
        const histories = await InventoryModel.find({ item: i._id.toString() });
        for(const history of histories) {
            balance += history.value;
        }

        return new Item(
            i._id.toString(),
            i.fullname,
            balance
        );
    }

    public static async create(fullname: string) {
        const i = await (new ItemModel({ fullname }).save());

        let balance = 0;
        const histories = await InventoryModel.find({ item: i._id.toString() });
        for(const history of histories) {
            balance += history.value;
        }

        return new Item(
            i._id.toString(),
            i.fullname,
            balance
        );
    }
}

export default Item;