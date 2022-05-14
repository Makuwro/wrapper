/**
 * Represents content. 
 * @prop {String} id The unique ID of the blog post.
 * @prop {User} owner The owner of the blog post.
 * @prop {Integer} privacyLevel The privacy level of the blog post.
 * @prop {String} slug The unique slug of the blog post.
 */
export default class Content {

  constructor(data, client) {

    this.id = data.id;
    this.slug = data.slug;
    this.client = client;

  }

}