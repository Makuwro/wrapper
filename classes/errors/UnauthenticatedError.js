export default class UnauthenticatedError extends Error {

  constructor() {

    super("A valid token is required to use this method.");

  }

}