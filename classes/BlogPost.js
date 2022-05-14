import Content from "./Content.js";

/**
 * Represents a blog post.
 * @prop {Object} collaborators An object of blog post collaborators.
 * @prop {User[]} collaborators.editors An array of blog post editors. This will not include the owner.
 * @prop {User[]} collaborators.reviewers An array of blog post reviewers.
 * @prop {User[]} collaborators.viewers An array of blog post viewers.
 * @prop {String} id The unique ID of the blog post.
 * @prop {User} owner The owner of the blog post.
 * @prop {Integer} privacyLevel The privacy level of the blog post.
 * @prop {String} slug The unique slug of the blog post.
 * @prop {String} title The title of the blog post.
 */
export default class BlogPost extends Content {

  constructor(data, client) {

    super(data, client);
    this.title = data.title;

  }

}