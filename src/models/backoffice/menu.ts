import crypto from "crypto";
import { Schema, model } from "mongoose";
import Item from "./item";
import MenuCategory from "./menu_category";


export interface IMenuRecipe {
    id: string;
    item: string;   // item id
    unit_used: number;
}

export interface IMenu {
    fullname: string;
    category: string; // menu category id
    recipes: Array<IMenuRecipe>;
};

export const MenuSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "backoffice.menu_category"
    },
    recipes: {
        type: [{
            id: {
                type: Schema.Types.ObjectId,
                required: true,
                auto: true
            },
            item: {
                type: String,
                required: true
            },
            unit_used: {
                type: Number,
                required: true
            }
        }]
    }
});

export const MenuModel = model<IMenu>("backoffice.menu", MenuSchema);

export class Menu {
    private _id: string;
    private _fullname: string;
    private _category: MenuCategory;
    private _recipes: Map<string, {
        id: string;
        item: Item;
        unit_used: number;
    }>;

    private constructor(id: string, fullname: string, category: MenuCategory, recipes: Array<{id: string; item: Item; unit_used: number;}>) {
        this._id = id;
        this._fullname = fullname;
        this._category = category;
        this._recipes = new Map<string, {id: string; item: Item; unit_used: number;}>();
        for(const recipe of recipes) {
            this._recipes.set(recipe.id, recipe);
        }
    }

    public get id() { return this._id;}
    public get fullname() { return this._fullname;}
    public get categories() { return this._category;}
    public get recipes() { return this._recipes;}

    public static async getById(id: string) {
        const m = await MenuModel.findById(id);
        if(!m) throw new Error(`Menu by id ${id} not found`);

        const category = await MenuCategory.getById(m.category);
        const recipes = new Array<{id: string; item: Item; unit_used: number;}>();
        for(const recipe of m.recipes) {
            const i = await Item.getById(recipe.item);
            recipes.push({
                id: recipe.id,
                item: i,
                unit_used: recipe.unit_used
            })
        }

        return new Menu(
            m._id.toString(),
            m.fullname,
            category,
            recipes
        )
    }

    public static async create(fullname: string, category: MenuCategory, recipes: Array<IMenuRecipe> = []) {
        const m = await (new MenuModel({fullname, category, recipes}).save());
        return await Menu.getById(m._id.toString());
    }

    public async addRecipe(item_id: string, unit_used: number) {
        const id = crypto.createHash("sha512").update(crypto.randomBytes(512)).digest("hex");
        const item = await Item.getById(item_id);

        const recipe = {
            id,
            item_id,
            unit_used
        }
        const m = await MenuModel.findByIdAndUpdate(this.id, { $push: { recipes: recipe } }, { new: true });
        if(!m) throw new Error(`Failed to add recipe with menu id ${this.id}`);
        this.recipes.set(recipe.id, { id, item, unit_used });

        return this;
    }

    public async updateRecipe(id: string, update: { item_id?: string, unit_used?: number }) {
        const recipe = this.recipes.get(id);
        if(!recipe) throw new Error(`Failed to update recipe, recipe ${id} not found`);

        const item = await Item.getById(update.item_id ?? recipe.item.id);
        if(!item) throw new Error(`Failed to update recipe, item with id ${update.item_id ?? recipe.item.id} not found`)

        const _update = {
            item_id: update.item_id ?? recipe.item.id,
            unit_used: update.unit_used ?? recipe.unit_used
        }

        const m = await MenuModel.findOneAndUpdate(
            { _id: this.id, "recipes.id": id },
            { $set: { "recipes.$": { id: recipe.id, item: _update.item_id, unit_used: _update.unit_used } } },
            { new: true }
        );
        if(!m) throw new Error(`Failed to update recipe. Internal Server Error.`);

        this.recipes.set(id, { id: recipe.id, item: item, unit_used: _update.unit_used});

        return this;
    }

    public async deleteRecipe(id: string) {
        const recipe = this.recipes.get(id);
        if (!recipe) throw new Error(`Failed to delete recipe, recipe ${id} not found`);

        const m = await MenuModel.findOneAndUpdate(
            { _id: this.id },
            { $pull: { recipes: { id: recipe.id } } },
            { new: true }
        );
        if (!m) throw new Error(`Failed to delete recipe. Internal Server Error.`);

        this.recipes.delete(id);

        return this;
    }
}