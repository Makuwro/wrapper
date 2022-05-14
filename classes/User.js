import Account from "./Account.js";

/**
 * Represents a user.
 * @prop {string} username The user's username.
 * @prop {string} [displayName] The user's display name.
 * @prop {boolean} isStaff True if the user is a Makuwro staff member.
 */
export default class User extends Account {

  constructor(data, client) {

    super(data, client);
    this.client = client;

  }

  async update(props) {

    if (props.password && typeof props.password !== "string") {

      

    }

  async createBlogPost() {

    return this.client.createBlogPost(this);

  }
  
}