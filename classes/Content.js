import User from "./User.js";

/**
 * Represents content. 
 * @prop {String} id The unique ID of the content.
 * @prop {User} owner The owner of the content.
 * @prop {Integer} privacyLevel The privacy level of the content.
 * @prop {String} slug The unique slug of the content.
 */
export default class Content {

  constructor(data = {}, client) {

    this.id = data.id;
    this.slug = data.slug;
    this.owner = data.owner;
    this.description = data.description;
    this.client = client;

    // Verify the owner object.
    if (this.owner && !(this.owner instanceof User)) {

      this.owner = new User(this.owner, client);

    }

  }

  async delete() {

    return await this.client.deleteContent(this);

  }

  async edit(options) {

    return await this.client.editContent(this, options);

  }

}