import "reflect-metadata";
import UserService from "./core/UserService.ioc";
import ScheduledTask from "./core/scheduledTask/ScheduledTask.provider";
import ServiceFactory from "./core/serviceLayer/ServiceFactory.injectable";
import RuleArray from "./core/validationEngine/RuleArray.injectable";
import RuleObject from "./core/validationEngine/RuleObject.injectable";
import TypeLib from "./core/validationEngine/TypeLib.provider";
import ServiceFormData from "./core/formData/ServcieFormData.provider";

const us = new UserService(
  {} as ScheduledTask,
  {} as ServiceFactory,
  {} as RuleArray,
  {} as RuleObject,
  {} as TypeLib,
  {} as ServiceFormData,
);

/**
 * ## ScheduledTask
 *
 * ScheduledTask serves as a scheduler for managing and executing tasks at specified intervals.
 * The module provides functionality to add tasks, both anonymous and named, to a task list.
 * These tasks are then executed periodically based on a configurable interval.
 *
 * ### key Features
 *
 * 1. Task Management:
 *
 *    - The module maintains a collection of tasks using a Map structure.
 *    - Tasks can be either anonymous (non-named) or named, allowing for flexibility in task management.
 *
 * 2. Interval Configuration:
 *
 *    - The execution interval for scheduled tasks is configurable,
 *      allowing users to set the frequency at which tasks are executed.
 *    - The default interval is set to 10 minutes (1000 * 60 * 10 milliseconds).
 *
 * 3. Task Execution:
 *
 *    - The execute method triggers the immediate execution of tasks.
 *    - Tasks are executed asynchronously at regular intervals based on the configured interval.
 *
 * 4. Task Addition:
 *
 *    - Tasks can be added to the scheduler using the addTask method.
 *      These tasks are assigned random names and are added to the
 *      task list regardless of whether similar tasks already exist.
 *    - Singleton tasks, added using the addSingletonTask method,
 *      are named tasks that are only added if a task with the same name does not already exist in the task list.
 *
 * 5. Interval Adjustment:
 *
 *    - The setInterval method allows for the dynamic adjustment of the execution interval.
 *      It performs validation to ensure that the interval is a positive number and that the
 *      adjustment is not attempted when the service has a parent (presumably, a Service instance).
 *
 * 6. Task Execution Control:
 *
 *    - The module starts and stops the scheduling of tasks based on the presence of tasks in the task list.
 *      The scheduling is controlled by an interval timer.
 *
 * 7. Task Cleanup:
 *
 *    - The clearSchedule method stops the scheduling of tasks and clears the entire task list.
 *
 */
export const scheduledTask = us.scheduledTask;

/**
 * encapsulate API routes or endpoints and generate a root service
 *
 * @description routes of final APIs that were output by this method are according to your configuration
 *
 * @param serviceConfig configuration of service
 * @returns instance of class Serivce, the final user interface,
 * all the routes and APIs will be defined as a property or method on it
 *
 * @example
 *
 * // 1. create a store service
 * const storeService = createService({
 *    baseURL: 'localhost:5678',
 *    name: 'storeAPI',
 *    api: { name: 'getAll' },
 *    children: [
 *      {
 *        route: 'products',
 *        api: [
 *          { name: 'getAll' },
 *          { name: 'getById', param: ['id'] },
 *        ]
 *      },
 *      { route: 'categrories', name: 'getAllCategrories' },
 *    ]
 * })
 *
 * // 2. access store service directly via variable
 * storeService.getAll()
 * storeService.products.getAll()
 * storeService.products.getById({ id: 3 })
 * storeService.categrories()
 *
 * // 3. mount the service on a global object and accessing service via the global object
 * storeService.mount(window)
 *
 * // 3-1. the service will automatically transform into the name you've gived to the root configuration
 * window.$storeAPI.getAll()
 * window.$storeAPI.products.getAll()
 * window.$storeAPI.products.getById({ id: 3 })
 * window.$storeAPI.categrories()
 */
export const createService = us.createService.bind(us);
/**
 * generate FormData based on the given object
 *
 * @param object expect an iterable object
 * @param deep receive true, or any other value that can be implicitly casting into true,
 * will dig out all the nested object and append values to the FormData
 *
 * @example
 *
 * // 1. define an object
 * const payload = {
 *    id: 1,
 *    user: {
 *      name: 'victor'
 *    }
 * }
 *
 * // 2. generate FormData
 * const fd = createFormData(payload)
 * // is equal to...
 * const fd = new FormData()
 * fd.append('id', payload.id)
 * fd.append('user', payload.user)
 *
 * // 3. generate FormData with passing true to the parameter 'deep'
 * const fd = createFormData(payload, true)
 * // is equal to...
 * const fd = new FormData()
 * fd.append('id', payload.id)
 * fd.append('user[name]', payload.user.name)
 */
export const createFormData = us.createFormData.bind(us);
/**
 * add a custom type to the type library of user-service
 *
 * @warn custom types do not shared with different root services,
 * which means one custom type can only be re-used in a same service
 *
 * @param type name of the custom type
 * @param validator a function to validate if an value matches the custom type
 *
 * @example
 *
 * // 1. define a custom type
 * const notReseverdName = defineType('nrn', (value) => !['victor', 'yvonne'].some((name) => value.includes(name)))
 *
 * // 2. use it in the rule object
 * export default {
 *    // ...
 *    api: {
 *      name: 'thisIsAMethodName',
 *      body: { name: 'this is a parameter of this method' }
 *      rules: { name: ['string', notReseverdName] },
 *      // or
 *      rules: { name: ['string', 'nrn'] },
 *    }
 * }
 */
export const defineType = us.defineType.bind(us);
/**
 * Treat multiple rules as the intersection of sets
 *
 * @param rules valid rules
 * @returns token of the intersection rule, directly assign it to any property of the rule object
 *
 * @example
 *
 * // 1. get the token by defining intersection rules
 * const forbiddenString = defineIntersection('string', (prop,  value) => ({
 *    valid: !value?.includes('foobar'),
 *    msg: `Parameter '${prop}' with '${value}' for value contains a forbidden word 'foobar'`
 * }))
 *
 * // 2. pass the return value to a rule object's property
 * export default {
 *    // ...
 *    api: {
 *      name: 'thisIsAMethodName',
 *      body: { title: 'this is a parameter of this method' }
 *      // parameter ' should be a string and cannot includes 'foobar'
 *      // parameter 'title' should be a string and cannot includes 'foobar'
 *      rules: { title: forbiddenString },
 *    }
 * }
 */
export const defineIntersection = us.defineIntersection.bind(us);
/**
 * Treat multiple rules as the union of sets
 *
 * @param rules valid rules
 * @returns token of the union rule, directly assign it to any property of the rule object
 *
 * @example
 *
 * // 1. get the token by defining union rules
 * const singleChar = defineUnion('string@1', 'int@0:9')
 *
 * // 2. pass the return value to a rule object's property
 * export default {
 *    // ...
 *    api: {
 *      name: 'thisIsAMethodName',
 *      body: { symbol: 'this is a parameter of this method' }
 *      // parameter 'symbol' should be a single character or an integer 0 to 9
 *      rules: { symbol: singleChar },
 *    }
 * }
 */
export const defineUnion = us.defineUnion.bind(us);
/**
 * combine multiple rule objects into a new object
 *
 * @description this function will neithor alter the requirement of properties nor mutate the given objects in-place
 *
 * @param targets valid rule objects
 * @returns combinated object of all given objects
 *
 * @example
 *
 * // 1. define two different rule objects
 * const ruleA = { userName: 'string@1:10' }
 * const ruleB = { age: 'int@0:120' }
 *
 * // 2. merge two rules
 * const mixture = mergeRules(ruleA, ruleB)
 * console.log(mixture)
 * // {
 * //   userName: 'string@1:10'
 * //   age: 'int@0:120'
 * // }
 */
export const mergeRules = us.mergeRules.bind(us);
/**
 * Copy all properties from the given object to a new object, and make all the properties optional
 *
 * @param target valid rule object
 * @returns new object with optional properties
 *
 * @example
 *
 * // 1. define rule object with required properties
 * const required = {
 *    email: 'string',
 *    password: 'string'
 * }
 *
 * // 2. create a same rule object with optional properties
 * const partial = partialRules(required)
 * console.log(partial)
 * // {
 * //   $email: 'string',
 * //   $password: 'string'
 * // }
 */
export const partialRules = us.partialRules.bind(us);
/**
 * Copy all properties from the given object to a new object, and make all the properties required
 *
 * @param target valid rule object
 * @returns new object with required properties
 *
 * @example
 *
 * // 1. define rule object with optional properties
 * const optional = {
 *    $email: 'string',
 *    $password: 'string'
 * }
 *
 * // 2. create a same rule object with required properties
 * const required = requiredRules(optional)
 * console.log(required)
 * // {
 * //   email: 'string',
 * //   password: 'string'
 * // }
 */
export const requiredRules = us.requiredRules.bind(us);
/**
 * Copy all properties from the given object to a new object, except selected keys
 *
 * @param target valid rule object
 * @param args keys that should be omited
 *
 * @example
 *
 * // 1. define a rule object
 * const userRules = {
 *    name: 'string',
 *    $age: 'int@1:120'
 * }
 *
 * // 2. create a new rule object by omiting keys from original object
 * const nameRule = omitRules(userRules, 'age') // => you don't need to mind about the requirements of the prop
 * console.log(nameRule)
 * // { name: 'string' }
 */
export const omitRules = us.omitRules.bind(us);
/**
 * Copy all selected properties from the given object to a new object
 *
 * @param target valid rule object
 * @param args keys that should be selected
 *
 * @example
 *
 * // 1. define a rule object
 * const userRules = {
 *    name: 'string',
 *    $age: 'int@1:120'
 * }
 *
 * // 2. create a new rule object by omiting keys from original object
 * const nameRule = pickRules(userRules, 'name')
 * console.log(nameRule)
 * // { name: 'string' }
 */
export const pickRules = us.pickRules.bind(us);

export default us;
