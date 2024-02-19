const z = require('zod')
const { User } = require('../models/user')
const { saveNewUser } = require('../services/user.service')

const employeeInfoSchema = z.object({
	firstname: z.string().min(1),
	lastname: z.string(),
	email: z.string().min(1).email(),
	password: z.string().min(8),
	password_confirmation: z.string().min(8),
    starting_day: z.coerce.date(),
    commission: z.number().min(0).max(100),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
})
async function newEmployee(req, res, next) {
    try {
		const newEmployeeInfo = employeeInfoSchema.parse(req.body)
		const newEmployee = await saveNewUser({...newEmployeeInfo, ['role']: 'EMPLOYEE', ['verified']: 1 })
		res.status(201).json({
			employeeId: newEmployee._id,
		});
	} catch (err) {
		next(err);
	}
}

async function getEmployees(req, res, next) {
    try {
        const employees = await User.find({ role: { $eq: 'EMPLOYEE' } })
        res.json(employees)
    } catch (err) {
        next(err)
    }
}

async function findEmployee(req, res, next) {
    try {
        const employee = await User.findById(req.params.id)
        res.json(employee)
    } catch(err) {
        next(err)
    }
}

async function updateEmployee(req, res, next) {
    try {
        const updatesInfo = employeeInfoSchema.parse(req.body)
        const updatedEmployee =  await User.updateOne({ _id: { $eq: req.params.id }}, updatesInfo)
        res.json(updatedEmployee)
    } catch (err) {
        next(err)
    }
}

async function deleteEmployee(req, res, next) {
    try {
        await User.deleteOne({ _id: { $eq: req.params.id }})
        res.json({})
    } catch(err) {
        next(err)
    }
}

module.exports = {
    newEmployee,
    getEmployees,
    findEmployee,
    updateEmployee,
    deleteEmployee
}