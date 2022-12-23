import { Schema, model } from "mongoose";
import User from "../user";
import Contact from "./contacts";

export interface IEmployee {
    fullname: string;
    contacts: Array<string>;            // id of contacts
    employment_date: Date;
    user_id: string;
    payroll: number;
};

export const EmployeeSchema = new Schema<IEmployee>({
    fullname: {
        type: String,
        required: true
    },
    contacts: {
        type: [String],
        required: true
    },
    employment_date: {
        type: Date,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    payroll: {
        type: Number,
        required: true
    }
});

export const EmployeeModel = model<IEmployee>("backoffice.employee", EmployeeSchema);

export class Employee {
    private _id: string;
    private _fullname: string;
    private _contacts: Array<Contact>;
    private _employmentDate: Date;
    private _user: User;
    private _payroll: number;

    private constructor(
        id: string,
        fullname: string,
        contacts: Array<Contact>,
        employmentDate: Date,
        user: User,
        payroll: number,
    ) {
        this._id = id;
        this._fullname = fullname;
        this._contacts = contacts;
        this._employmentDate = employmentDate;
        this._user = user;
        this._payroll = payroll;
    }

    public get id() { return this._id; }
    public get fullname() { return this._fullname; }
    public get contacts() { return this._contacts; }
    public get employmentDate() { return this._employmentDate; }
    public get user() { return this._user; }
    public get payroll() { return this._payroll; }

    public static async getById(id: string) {
        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            throw new Error(`Employee with id ${id} not found`);
        }

        const user = await User.getById(employee.user_id);
        const contacts = await Promise.all(
            employee.contacts.map(async (contactId: string) => {
                return await Contact.getById(contactId);
            }),
        );

        return new Employee(
            employee._id.toString(),
            employee.fullname,
            contacts,
            employee.employment_date,
            user,
            employee.payroll,
        );
    }

    public static async create(
        fullname: string,
        contacts: Array<string>,
        employmentDate: Date,
        userId: string,
        payroll: number,
    ) {
        const employee = await (new EmployeeModel({
            fullname,
            contacts,
            employment_date: employmentDate,
            user_id: userId,
            payroll,
        })).save();

        return await Employee.getById(employee._id.toString());
    }

    public async update(update: Partial<IEmployee>) {
        const employee = await EmployeeModel.findByIdAndUpdate(this.id, update, { new: true });
        if (!employee) {
            throw new Error(`Employee with id ${this.id} not found`);
        }

        const user = await User.getById(employee.user_id);
        const contacts = await Promise.all(
            employee.contacts.map(async (contactId: string) => {
                return await Contact.getById(contactId);
            }),
        );

        this._fullname = employee.fullname;
        this._contacts = contacts;
        this._employmentDate = employee.employment_date;
        this._user = user;
        this._payroll = employee.payroll;

        return this;
    }

    public static async delete(id: string) {
        const employee = await EmployeeModel.findByIdAndDelete(id);
        if (!employee) {
            throw new Error(`Employee with id ${id} not found`);
        }
    }
}  