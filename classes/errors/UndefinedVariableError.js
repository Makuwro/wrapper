export default class UndefinedQueryError extends Error {

  constructor(variable) {

    super(`No ${variable} provided`);

  }

}