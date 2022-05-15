/**
 * @prop {string} id Represents the account ID
 * @prop {string} username Represents the account unique name
 */
export default class Account {

  constructor(data, client) {

    // Save the account data.
    this.username = data.username;
    this.displayName = data.displayName;
    this.id = data.id;
    this.avatarPath = data.avatarPath;
    this.bannerPath = data.bannerPath;
    this.css = data.css;
    this.terms = data.terms;

    // Save the client.
    this.client = client;

  }

  async createArt() {

    return this.client.createArt(this);

  }

  async createBlogPost() {

    return this.client.createBlogPost(this);

  }

  async getAllArt() {

    return this.client.getAllArt(this);

  }

  async getAllBlogPosts() {

    return this.client.getAllBlogPosts(this);

  }

  async getAllCharacters() {

    return this.client.getAllCharacters(this);

  }

  async getBlogPosts() {

    return this.client.getBlogPosts(this);

  }

}