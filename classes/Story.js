import Content from "./Content.js";

/**
 * Represents a story.
 * @prop {String} id The unique ID of the story.
 * @prop {User} owner The owner of the story.
 * @prop {Integer} privacyLevel The privacy level of the story.
 * @prop {String} slug The unique slug of the story.
 * @prop {String} title The title of the story.
 */
export default class Story extends Content {

  static apiDirectoryName = "stories";

  constructor(data, client) {

    super(data, client);
    this.title = data.title;

  }

}