// eslint-disable-next-line no-unused-vars
import Client from "./Client.js";

/**
 * @prop {string} id Represents the account ID
 * @prop {string} username Represents the account unique name
 */
export default class Account {

  /** @type {Client} */
  #client;

  constructor(data, client) {

    this.username = data.username;
    this.displayName = data.displayName;
    this.id = data.id;
    this.avatarPath = data.avatarPath;
    this.bannerPath = data.bannerPath;
    this.css = data.css;
    this.terms = data.terms;
    this.isBanned = data.isBanned;
    this.#client = client;

  }

  async createArt() {

    return this.#client.createArt(this.username);

  }

  async createBlogPost() {

    return this.#client.createBlogPost(this.username);

  }

  async delete(password) {

    await this.#client.deleteAccount(this.constructor, this.username, password);

  }

  async disable(password) {

    await this.#client.disableAccount(this.constructor, this.username, password);

  }

  async getAllArt() {

    return this.#client.getAllArt(this.username);

  }

  async getAllBlogPosts() {

    return this.#client.getAllBlogPosts(this.username);

  }

  async getAllCharacters() {

    return this.#client.getAllCharacters(this.username);

  }

  async getAllNotifications() {

    return this.#client.getAllNotifications(this.username);

  }

  async getBlogPosts() {

    return this.#client.getBlogPosts(this.username);

  }

}