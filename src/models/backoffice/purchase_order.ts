import { Schema, model } from "mongoose";
import Item from "./item";
import Vendor from "./vendor";

export interface IPurchaseOrder {
    order_number: string;
    vendor: string;
    item: string;
    quantity: number;
    peritem_price: number;
    other_price_name: string;
    other_price: number;
    date: string;
    payment_date: Date;
    delivery_date: Date;
    is_paid: boolean;
    is_delivered: boolean;
};

export const PurchaseOrderSchema = new Schema({
    order_number: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    vendor: {
        type: String,
        required: true,
        ref: "backoffice.vendor"
    },
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "backoffice.item"
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    peritem_price: {
        type: Number,
        required: true,
        default: 0
    },
    other_price_name: {
        type: String,
        required: true
    },
    other_price: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: String,
        required: true,
        default: () => new Date()
    },
    payment_date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    delivery_date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    is_paid: {
        type: Boolean,
        required: true,
    },
    is_delivered: {
        type: Boolean,
        required: true,
    },
});

export const PurchaseOrderModel = model<IPurchaseOrder>("backoffice.purchase_order", PurchaseOrderSchema);

export class PurchaseOrder {
    private _id: string;
    private _order_number: string;
    private _vendor: Vendor;
    private _item: Item;
    private _quantity: number;
    private _peritem_price: number;
    private _other_price_name: string;
    private _other_price: number;
    private _date: string;
    private _payment_date: Date;
    private _delivery_date: Date;
    private _is_paid: boolean;
    private _is_delivered: boolean;

    private constructor(
        id: string,
        order_number: string,
        vendor: Vendor,
        item: Item,
        quantity: number,
        peritem_price: number,
        other_price_name: string,
        other_price: number,
        date: string,
        payment_date: Date,
        delivery_date: Date,
        is_paid: boolean,
        is_delivered: boolean
    ) {
        this._id = id;
        this._order_number = order_number;
        this._vendor = vendor;
        this._item = item;
        this._quantity = quantity;
        this._peritem_price = peritem_price;
        this._other_price_name = other_price_name;
        this._other_price = other_price;
        this._date = date;
        this._payment_date = payment_date;
        this._delivery_date = delivery_date;
        this._is_paid = is_paid;
        this._is_delivered = is_delivered;
    }

    public get id() { return this._id }
    public get order_number() { return this._order_number }
    public get vendor() { return this._vendor }
    public get item() { return this._item }
    public get quantity() { return this._quantity }
    public get peritem_price() { return this._peritem_price }
    public get other_price_name() { return this._other_price_name }
    public get other_price() { return this._other_price }
    public get date() { return this._date }
    public get payment_date() { return this._payment_date }
    public get delivery_date() { return this._delivery_date }
    public get is_paid() { return this._is_paid }
    public get is_delivered() { return this._is_delivered }

    public static async getById(id: string) {
        const po = await PurchaseOrderModel.findById(id);
        if(!po) throw new Error(`Purchase Order with id ${id}`);
        
        const vendor = await Vendor.getById(po.vendor);
        const item = await Item.getById(po.item);

        return new PurchaseOrder(
            po.id.toString(),
            po.order_number,
            vendor,
            item,
            po.quantity,
            po.peritem_price,
            po.other_price_name,
            po.other_price,
            po.date,
            po.payment_date,
            po.delivery_date,
            po.is_paid,
            po.is_delivered,
        );
    }

    public static async create(
        vendor_id: string,
        item_id: string,
        quantity: number,
        peritem_price: number,
        payment_date: Date,
        delivery_date: Date,
        is_paid: boolean,
        is_delivered: boolean,
        other_price_name: string = "None",
        other_price: number = 0,
    ) {
        const vendor = await Vendor.getById(vendor_id);
        const item = await Item.getById(item_id);
        
        const date = new Date();
        const startOfMonth = new Date(date.getTime());
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(date.getTime());
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(1);
        endOfMonth.setHours(0, 0, 0, 0);

        const document_count = await PurchaseOrderModel.countDocuments({ date: {
            $gte: startOfMonth,
            $lt: endOfMonth
        }});

        const order_number = "PO-" + date.getMonth().toString().padStart(2, "0") + date.getFullYear().toString() + (document_count + 1).toString().padStart(8, "0");
        const po = await (new PurchaseOrderModel({
            order_number: order_number,
            vendor: vendor_id,
            item: item_id,
            quantity: quantity,
            peritem_price: peritem_price,
            other_price_name: other_price_name,
            other_price: other_price,
            date: date,
            payment_date: payment_date,
            delivery_date: delivery_date,
            is_paid: is_paid,
            is_delivered: is_delivered,
        }).save());

        return new PurchaseOrder(
            po.id.toString(),
            po.order_number,
            vendor,
            item,
            po.quantity,
            po.peritem_price,
            po.other_price_name,
            po.other_price,
            po.date,
            po.payment_date,
            po.delivery_date,
            po.is_paid,
            po.is_delivered,
        );
    }
}