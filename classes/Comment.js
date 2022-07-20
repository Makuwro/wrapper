import Content from "./Content.js";

/**
 * Represents a comment.
 * @prop {String} id The unique ID of the comment.
 * @prop {User|Team} owner The owner of the comment.
 * @prop {String} content The content of the comment.
 */
export default class Comment extends Content {

  static apiDirectoryName = "comments";

  #client;

  constructor(data, client) {

    super(data, client);
    this.content = data.content;
    this.parent = data.parent;
    this.#client = client;

  }

  async delete() {

    await this.#client.deleteComment(this.constructor, null, this.id);

  }
  
}