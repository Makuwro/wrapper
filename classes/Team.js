import Account from "./Account.js";

/**
 * Represents a team.
 * @prop {String} username The user's username.
 * @prop {String} [displayName] The user's display name.
 */
export default class Team extends Account {

  constructor(data, client) {

    super(data, client);

  }
  
}