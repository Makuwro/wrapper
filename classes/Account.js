/**
 * @prop {string} id Represents the account ID
 * @prop {string} username Represents the account unique name
 */
export default class Account {

  /** @typedef {import("./Client").default} Client */
  /** @type {Client} */
  #client;

  constructor(data, client) {

    this.username = data.username;
    this.displayName = data.displayName;
    this.id = data.id;
    this.bannerPath = data.bannerPath;
    this.css = data.css;
    this.terms = data.terms;
    this.isBanned = data.isBanned;
    this.#client = client;

  }

  async createArt(slug, props) {

    return await this.#client.createArt(this.username, slug, props);

  }

  async createBlogPost() {

    return await this.#client.createBlogPost(this.username);

  }

  async createCharacter(slug, props) {

    return await this.#client.createCharacter(this.username, slug, props);

  }

  async createStory(slug, props) {

    return await this.#client.createStory(this.username, slug, props);

  }

  async createWorld(slug, props) {

    return await this.#client.createWorld(this.username, slug, props);
    
  }

  async delete(password) {

    await this.#client.deleteAccount(this.constructor, this.username, password);

  }

  async disable(password) {

    await this.#client.disableAccount(this.constructor, this.username, password);

  }

  async getContent(contentType, slug) {

    return this.#client.getContent(contentType, this.username, slug);

  }

  async getAllContent(contentType) {

    return this.#client.getAllContent(contentType, this.username);

  }

}