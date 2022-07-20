import Content from "./Content.js";

/**
 * Represents a comment.
 * @prop {String} id The unique ID of the comment.
 * @prop {User|Team} owner The owner of the comment.
 * @prop {String} content The content of the comment.
 */
export default class Comment extends Content {

  static apiDirectoryName = "comments";

  /** @typedef {import("./Client").default} Client */
  /** @type {Client} */
  #client;

  constructor(data, client) {

    super(data, client);
    this.content = data.content;
    this.parent = data.parent;
    this.#client = client;

  }

  /**
   * Requests the server to delete a comment.
   * @since v1.0.0
   */
  async delete() {

    await this.#client.deleteComment(this.id);

  }

  /**
   * Requests the server to update a comment.
   * @since v1.0.0
   * @param {object} props
   * @param {object} [content]
   * @param {string} [content.text]
   */
  async update(props) {

    await this.#client.updateComment(this.id, props);

  }
  
}