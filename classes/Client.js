import UnauthenticatedError from "./errors/UnauthenticatedError.js";
import UndefinedVariableError from "./errors/UndefinedVariableError.js";
import User from "./User.js";
import Art from "./Art.js";
import BlogPost from "./BlogPost.js";

/**
 * Represents a client.
 * @prop {Object} endpoints An object of API endpoints.
 * @prop {Object} endpoints.prod An object of production API endpoints.
 * @prop {String} endpoints.prod.rest The production REST API endpoint.
 * @prop {String} endpoints.prod.websocket The production websocket endpoint.
 * @prop {Object} endpoints.dev An object of development API endpoints.
 * @prop {String} endpoints.dev.rest The development REST API endpoint.
 * @prop {String} endpoints.dev.websocket The development websocket endpoint. 
 * @prop {String} [token] The token of the user account.
 * @prop {Integer} timeout The maximum time in milliseconds that a request can take before it times out.
 * @prop {User} [user] The current, authenticated user.
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
  };
  timeout = 15000;

  constructor(token, mode = "dev") {

    this.token = token;
    this.endpoints = Client.endpoints[mode];

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
      await this.getUser();

    }

  }

  /**
   * Creates a new blog post.
   * 
   * Errors if the client's user is not a delegate of the specified owner.
   * @param {User} [owner] The owner of the blog post. Defaults to the authenticated user.
   * @returns {BlogPost} A blog post object.
   */
  async createBlogPost(owner = this.getUser()) {

    const response = await fetch(`${this.endpoints.rest}contents/blog/${owner.username}`, {
      method: "POST",
      headers: {
        token: this.token
      }
    });

    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromCode(data.code, data.message);

    }

    return new BlogPost(data, this.client);

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

    return data.token;

  }

  /**
   * Gets all blog posts that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {User} owner The user to search.
   * @returns {BlogPost[]} An array of blog posts.
   */
  async getAllBlogPosts(owner = this.getUser()) {

    const data = this.requestREST(`contents/blog/${owner.username}`);

    for (let i = 0; data.length > i; i++) {

      data[i] = new BlogPost(data[i]);

    }

    return data;

  }

  /**
   * Gets a blog post.
   * 
   * Errors if the blog post doesn't exist.
   * @param {User} [owner] 
   * @param {String} slug 
   * @returns {BlogPost} The blog post.
   */
  async getBlogPost(owner = this.getUser(), slug) {

    // Get the data from the API.
    const data = await this.requestREST(`contents/blog/${owner.username}/${slug}`);
    
    // Create a BlogPost object from the data.
    return new BlogPost(data);

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
    const self = (!username && !id) || (id && id === this.user?.id) || (username && username.toLowerCase() === this.user?.username.toLowerCase());
    if (self) {
      
      if (this.user) {
    
        // No need to waste an API call.
        return this.user;

      } else if (!this.token) {

        throw new UnauthenticatedError();

      }

    }

    // Get the user data from the server.
    const data = await this.requestREST(`accounts/user${self ? "" : `s/${username}`}`);

    // Create a User object from the user data.
    const user = new User(data, this);

    // Check if we need to save it to the client.
    if (self) {

      this.user = user;

    }

    // Return the user object.
    return user;

  }

  /**
   * Sends a request to the Makuwro API.
   * @param {String} path The API endpoint.
   * @returns 
   */
  async requestREST(path, {method = "GET", headers = {}} = {method: "GET", headers: {}}) {
    
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    const response = await fetch(`${this.endpoints.rest}${path}`, {
      headers: this.token ? {
        ...headers,
        token: this.token
      } : headers,
      signal: controller.signal,
      method
    });
    
    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromCode(data.code, data.message);

    }

    return data;

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