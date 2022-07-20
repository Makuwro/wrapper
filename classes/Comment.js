import Content from "./Content.js";

/**
 * Represents a comment.
 * @prop {String} id The unique ID of the comment.
 * @prop {User|Team} owner The owner of the comment.
 * @prop {String} content The content of the comment.
 */
export default class Comment extends Content {

  constructor(data, client) {

    super(data, client);

  }
  
}