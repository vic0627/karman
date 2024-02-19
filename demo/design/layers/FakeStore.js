import { Karman } from "../super/karman";
import Auth from "./Auth";
import Cart from "./Cart";
import Product from "./Product";
import User from "./User";

export default class FakeStore extends Karman {
    /** @type {Product} */
    product;

    /** @type {User} */
    user;

    /** @type {Cart} */
    cart;

    /** @type {Auth} */
    auth;
}