import Content from "./Content.js";

/**
 * Represents a character.
 * @prop {String} id The unique ID of the character.
 * @prop {User} owner The owner of the character.
 * @prop {Integer} privacyLevel The privacy level of the character.
 * @prop {String} slug The unique slug of the character.
 * @prop {String} name The title of the character.
 */
export default class Character extends Content {

  static apiDirectoryName = "characters";

  constructor(data, client) {

    super(data, client);
    this.name = data.name;

  }

}