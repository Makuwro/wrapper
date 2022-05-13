import UndefinedVariableError from "./errors/UndefinedVariableError.js";
import User from "./User.js";

/**
 * Represents a client.
 * @property {string} [token] The token of the user account.
 */
export default class Client {

  static endpoints = {
    prod: {
      rest: "https://api.makuwro.com/",
      websocket: "ws://api.makuwro.com"
    },
    dev: {
      rest: "http://localhost:3001/",
      websocket: "ws://localhost:3001"
    }
  }
  mode = "dev";
  timeout = 15000;

  constructor(token) {

    this.token = token;
    this.endpoints = Client.endpoints[this.mode];

  }

  /**
   * Connects to the Makuwro gateway.
   */
  async connect() {

    // Now try connecting to the server.
    this.ws = new WebSocket(this.endpoints.websocket);

    // Check if we have a token.
    if (this.token) {

      // Verify that the user is authenticated.
      await this.getAuthenticatedUser();

    }

  }
  
  /**
   * Creates a new Makuwro user account. 
   * 
   * Errors if the username is taken or protected, the username and/or password are too short or too long, or account creation at the current IP address has been disabled.
   * @param {Object} data An object that represents the account data.
   * @param {string} data.username The username of the account.
   * @param {string} data.password The password of the account.
   * @param {string} data.email The email address of the account owner.
   * @param {number} data.birthDate The birth date of the account owner.
   * @returns {User} A User object.
   */
  async createUser({username, password, birthDate, email}) {

    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    form.append("birthDate", birthDate);
    form.append("email", email);

    const response = await fetch(`${this.endpoints.rest}accounts/user`, {
      method: "POST",
      body: form
    });

    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromCode(data.code, data.message);

    }

    return new User(data, this);

  }

  /**
   * Disconnects from the Makuwro gateway.
   */
  async disconnect() {

    if (this.ws) {

      this.ws.close();

    }

  }

  /**
   * Requests a new token from the server. 
   * 
   * Errors if the username-password combination is incorrect.
   * @param {String} username The username of the user account.
   * @param {String} password The password of the user account.
   * @returns {String} A token string.
   */
  async generateToken(username, password) {

    const response = await fetch(`${this.endpoints.rest}accounts/user/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        username,
        password
      }
    });
    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromCode(data.code, data.message);

    }

    return token;

  }

  /**
   * Returns the authenticated user. 
   * 
   * Errors if there is no authenticated user.
   * @returns {User} A User object.
   */
  async getAuthenticatedUser() {

    if (!this.user) {

      if (!this.token) {

        throw new UndefinedVariableError("token");

      }

      this.user = await this.getUser();

    }

    return this.user;

  }

  /**
   * Uses a username or an ID to return a user. 
   * 
   * If no parameters are provided, the authenticated user is returned, if the Client object holds a valid token.
   * 
   * If a username and an ID is provided, the username is prioritized.
   * 
   * Errors if no user is found.
   * @param {Object} [data] An object of the user's username or unique ID.
   * @param {String} [data.username] The user's username.
   * @param {String} [data.id] The user's unique ID.
   * @returns {User} The desired user. 
   */
  async getUser({username, id} = {}) {

    // Check if we're getting ourselves.
    const self = (!username && !id) || id === this.user.id || username.toLowerCase() === this.username.toLowerCase();
    if (self) {
      
      if (this.user) {
    
        // No need to waste an API call.
        return this.user;

      } else if (!this.token) {

        throw new UndefinedVariableError("token");

      }

    }

    // Get the user data from the server.
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    const response = await fetch(`${this.endpoint.rest}accounts/user${self ? "" : `s/${username}`}`, {
      headers: {
        token: this.token
      },
      signal: controller.signal
    });
    const data = await response.json();

    if (!response.ok) {

      throwErrorFromCode(data.code, data.message);

    }

    // Create a User object from the user data, then return it.
    return new User(data, this);

  }

  /**
   * Searches the Makuwro database based on a specific query or content type.
   * @param {string} query A keyword.
   * @param {int} type A content type.
   * @returns {[Art | BlogPost | Comment | Character | User]} An array of content.
   */
  async search(query, type) {

    // Make sure we got a query.
    if (!query) {

      throw new UndefinedVariableError("query");

    } else if (!type) {

      throw new UndefinedVariableError("type");

    }

    // Wrap this around a try-catch just in case fetch() throws an error.
    try {

      // Now ask the server for some search results.
      const response = await fetch(`${this.endpoints.rest}search?query=${query}`);
      if (!response.ok) {

        throw new Error();

      }
      
      // Return the search results.
      return response.json();

    } catch (err) {



    }

  }

  /**
   * Searches for an error from a specified code, and then throws it with the error message as a parameter.
   * 
   * If the code is not found, an UnknownError object is thrown instead.
   * @param {number} code The error code.
   * @param {string} [message] The error message.
   * @returns {Error} The error. 
   */
  static throwErrorFromCode(code, message) {

    switch (code) {

      case 0:
        break;

      default:
        throw new Error(message);

    }

  }

}