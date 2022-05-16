export default class CredentialsError extends Error {

  constructor() {

    super("The username and password combination is incorrect.");

  }

}