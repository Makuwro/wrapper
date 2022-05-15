import Content from "./Content.js";

/**
 * Represents art.
 * @prop {String} id The unique ID of the art.
 * @prop {User} owner The owner of the art.
 * @prop {Integer} privacyLevel The privacy level of the art.
 * @prop {String} slug The unique slug of the art.
 * @prop {String} title The title of the art.
 */
export default class Art extends Content {

  static apiDirectoryName = "art";

  constructor(data, client) {

    super(data, client);

  }

}