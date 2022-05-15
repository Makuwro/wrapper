import Content from "./Content.js";

/**
 * Represents a notification.
 * @prop {String} id The unique ID of the notification.
 * @prop {User} owner The owner of the notification.
 */
export default class Notification extends Content {

  static apiDirectoryName = "notifications";

  constructor(data, client) {

    super(data, client);

  }

}