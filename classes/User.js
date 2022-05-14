import Account from "./Account.js";

/**
 * Represents a user.
 * @prop {string} username The user's username.
 * @prop {string} [displayName] The user's display name.
 * @prop {boolean} isStaff True if the user is a Makuwro staff member.
 * @prop {boolean} isBanned True if the user is currently banned.
 */
export default class User extends Account {

  constructor(data, client) {

    super(data, client);
    this.client = client;

  }

  async update(props) {

    if (props.password && typeof props.password !== "string") {

      // TODO: Verify password

    }

    return await super.update(props, this.client);

  }

  async createBlogPost() {

    return this.client.createBlogPost(this);

  }

  async getAllBlogPosts() {

    return this.client.getAllBlogPosts(this);

  }

  async getBlogPosts() {

    return this.client.getBlogPosts(this);

  }
  
}