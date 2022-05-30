// eslint-disable-next-line no-unused-vars
import Client from "./Client.js";
import Account from "./Account.js";

/**
 * Represents a user.
 * @prop {string} username The user's username.
 * @prop {string} [displayName] The user's display name.
 * @prop {boolean} isStaff True if the user is a Makuwro staff member.
 * @prop {boolean} isBanned True if the user is currently banned.
 * @prop {number} lastOnline The time in milliseconds when the user was last online.
 */
export default class User extends Account {

  /** @type {Client} */
  #client;

  constructor(data, client) {

    super(data, client);
    this.isStaff = data.isStaff;
    this.lastOnline = data.lastOnline;
    this.#client = client;

  }
  
}