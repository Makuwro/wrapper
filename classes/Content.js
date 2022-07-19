import User from "./User.js";

/**
 * Represents content. 
 * @prop {String} id The unique ID of the content.
 * @prop {User} owner The owner of the content.
 * @prop {Integer} privacyLevel The privacy level of the content.
 * @prop {String} slug The unique slug of the content.
 */
export default class Content {

  /** @typedef {import("./Client").default} Client */
  /** @type {Client} */
  #client;

  constructor(data, client) {

    this.id = data.id;
    this.slug = data.slug;
    this.owner = data.owner;
    this.description = data.description;
    this.contentWarning = data.contentWarning;
    this.ageRestrictionLevel = data.ageRestrictionLevel;
    this.uploadedOn = data.uploadedOn;
    this.#client = client;

    // Verify the owner object.
    if (this.owner && !(this.owner instanceof User)) {

      this.owner = new User(this.owner, client);

    }

  }

  /**
   * Requests the server to delete a piece of content.
   * 
   * The authenticated user must have access to the specified content; otherwise, this method will fail.
   * @since v1.0.0
   */
  async delete() {

    await this.#client.deleteContent(this.constructor, this.owner.username, this.slug);

  }

  async update(props) {

    return await this.#client.updateContent(this.constructor, this.owner.username, this.slug, props);

  }

}