export default class InvalidTokenError extends Error {

  code = 0;

  constructor() {

    super("Invalid token");

  }

}