import { Schema, model } from "mongoose";
import Vendor from "./vendor";
import Customer from "./customer";

export interface IRelation {
    related: string,
    relation_model: string,
    relation_type: string
}

export const RelationSchema = new Schema({
    related: {
        type: Schema.Types.ObjectId,
        required: true
    },
    relation_model: {
        type: String,
        required: true,
        lower: true,
        enum: ["customer", "vendor"]
    },
    relation_type: {
        type: String,
        required: true,
        lower: true
    }
});

export const RelationModel = model<IRelation>("backoffice.relation", RelationSchema);

export class Relation {
    private _id: string;
    private _related: Vendor | Customer;
    private _relation_type: string;

    private constructor(id: string, related: Vendor, relation_type: string) {
        this._id = id;
        this._related = related;
        this._relation_type = relation_type;
    }

    public get id(){ return this._id }
    public get related() { return this._related }
    public get relation_type() { return this._relation_type }

    public static async getById(id: string) {
        const r = await RelationModel.findById(id);
        if(!r) throw new Error(`Relation with id ${id} not found`);

        let relation: Vendor | Customer;
        if(r.relation_model == "customer") {
            relation = await Customer.getById(r.related);
        } else {
            relation = await Vendor.getById(r.related);
        }
    }
}

export default Relation;