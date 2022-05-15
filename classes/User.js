import Account from "./Account.js";

/**
 * Represents a user.
 * @prop {String} username The user's username.
 * @prop {String} [displayName] The user's display name.
 * @prop {Boolean} isStaff True if the user is a Makuwro staff member.
 * @prop {Boolean} isBanned True if the user is currently banned.
 * @prop {Number} lastOnline The time in milliseconds when the user was last online.
 */
export default class User extends Account {

  constructor(data, client) {

    super(data, client);
    this.lastOnline = data.lastOnline;
    this.client = client;

  }

  async update(props) {

    if (props.password && typeof props.password !== "string") {

      // TODO: Verify password

    }

    return await super.update(props, this.client);

  }
  
}