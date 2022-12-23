import { Schema, model } from "mongoose";

export interface IMenuCategory {
    fullname: string;
};

export const MenuCategorySchema = new Schema({
    fullname: {
        type: String,
        required: true
    }
})

export const MenuCategoryModel = model<IMenuCategory>("backoffice.menu_category", MenuCategorySchema);

const __menu_category_memo = new Map<string, MenuCategory>();
export class MenuCategory {
    private __is_deleted: boolean;
    private _id: string;
    private _fullname: string;

    private constructor(id: string, fullname: string) {
        this.__is_deleted = false;
        this._id = id;
        this._fullname = fullname;

        __menu_category_memo.set(id, this);
    }

    public get id() { return this._id }
    public get fullname() { return this._fullname}

    public static async getById(id: string) {
        const _mc = __menu_category_memo.get(id);
        if(_mc) return _mc;

        const mc = await MenuCategoryModel.findById(id);
        if(!mc) throw new Error(`Menu Category by Id ${id} not found`)

        return new MenuCategory(mc._id.toString(), mc.fullname);
    }

    public static async create(fullname: string) {
        const mc = await (new MenuCategoryModel({fullname: fullname}).save())
        return await MenuCategory.getById(mc._id.toString());
    }

    public async delete(id: string) {
        if(this.__is_deleted) throw new Error(`Menu Category by id ${id} already deleted`);
        const mc = await MenuCategoryModel.findByIdAndDelete(id);
        if(!mc) return false;

        __menu_category_memo.delete(id);
        this.__is_deleted = true;

        return true
    }

    public async update(fullname?: string) {
        if(this.__is_deleted) throw new Error(`Menu Category by id ${this.id} already deleted`);
        const mc = await MenuCategoryModel.findByIdAndUpdate(this.id, { fullname: fullname ?? this.fullname});
        if(!mc) return false;

        this._fullname = fullname ?? this.fullname;
        __menu_category_memo.set(this.id, this);
        return true;
    }
}

export default MenuCategory;