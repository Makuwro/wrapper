import UnauthenticatedError from "./errors/UnauthenticatedError.js";
import UndefinedVariableError from "./errors/UndefinedVariableError.js";
import InvalidTokenError from "./errors/InvalidTokenError.js";
import User from "./User.js";
import Art from "./Art.js";
import BlogPost from "./BlogPost.js";
import Character from "./Character.js";

/**
 * Represents a client.
 * @prop {Object} endpoints An object of API endpoints.
 * @prop {Object} endpoints.prod An object of production API endpoints.
 * @prop {string} endpoints.prod.rest The production REST API endpoint.
 * @prop {string} endpoints.prod.websocket The production websocket endpoint.
 * @prop {Object} endpoints.dev An object of development API endpoints.
 * @prop {string} endpoints.dev.rest The development REST API endpoint.
 * @prop {string} endpoints.dev.websocket The development websocket endpoint. 
 * @prop {string} [token] The token of the user account.
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
      rest: "http://192.168.0.9:3001/",
      websocket: "ws://192.168.0.9:3001"
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

  async createArt(username = this.getUser().username) {

    return await this.createContent(Art, username);

  }

  /**
   * Creates a new blog post.
   * 
   * Errors if the client's user is not a delegate of the specified owner.
   * @param {string} [username] The owner of the blog post. Defaults to the authenticated user.
   * @returns {BlogPost} A blog post object.
   */
  async createBlogPost(username = this.getUser().username) {

    return await this.createContent(BlogPost, username);

  }

  /**
   * Creates a new piece of content.
   * 
   * Errors if the client doesn't have permission to assign the owner.
   * @param {Art | BlogPost | Character} type The type of content to create.
   * @param {string} [username] The owner of the content. Defaults to the authenticated user.
   * @param {*} options 
   * @returns 
   */
  async createContent(type, username = this.getUser().username, options) {

    const response = await fetch(`${this.endpoints.rest}contents/${type.apiDirectoryName}/${username}`, {
      method: "POST",
      headers: {
        token: this.token
      }
    });

    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromCode(data.code, data.message);

    }

    return new type(data, this.client);

  }
  
  /**
   * Creates a new Makuwro user account. 
   * 
   * Errors if the username is taken or protected, the username and/or password are too short or too long, or account creation at the current IP address has been disabled.
   * @param {Object} data An object that represents the account data.
   * @param {string} data.username The username of the account.
   * @param {string} data.password The password of the account.
   * @param {string} data.email The email address of the account owner.
   * @param {Number} data.birthDate The birth date of the account owner.
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
   * Requests a new session token from the server. 
   * 
   * Errors if the username-password combination is incorrect.
   * @param {string} username The username of the user account.
   * @param {string} password The password of the user account.
   * @returns {Object} An object containing session information, including the token.
   */
  async createSession(username, password) {

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

    return data;

  }

  /**
   * Disconnects from the Makuwro gateway.
   */
  async disconnect() {

    if (this.ws) {

      this.ws.close();

    }

  }

  async deleteContent(content) {



  }

  /**
   * Sends a request to revoke a session token.
   * @param {string} token The session token to revoke. Defaults to the current session token.
   */
  async deleteSessionToken(token = this.token) {

    await this.requestREST("accounts/user/sessions", {
      method: "DELETE",
      headers: {token}
    });

  }

  async editContent(content) {



  }

  /**
   * Gets all art that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {Art[]} An array of art.
   */
  async getAllArt(username = this.getUser().username) {

    return this.getAllContent(Art, username);

  }

  /**
   * Gets all blog posts that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {BlogPost[]} An array of blog posts.
   */
  async getAllBlogPosts(username = this.getUser()) {

    return this.getAllContent(BlogPost, username);

  }

  /**
   * Gets all characters that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The user to search.
   * @returns {Character[]} An array of characters.
   */
  async getAllCharacters(username = this.getUser().username) {

    return this.getAllContent(Character, username);

  }

  /**
   * Gets all of a type of content.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {Art | BlogPost | Character} type The class of content to get.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {Art[] | BlogPost[] | Character[]} An array of content.
   */
  async getAllContent(type, username = this.getUser().username) {

    const data = this.requestREST(`contents/${type.apiDirectoryName}/${username}`);

    for (let i = 0; data.length > i; i++) {

      data[i] = new type(data[i]);

    }

    return data;

  }

  /**
   * Gets a blog post.
   * 
   * Errors if the blog post doesn't exist.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @param {string} slug 
   * @returns {BlogPost} The blog post.
   */
  async getBlogPost(username = this.getUser().username, slug) {

    return this.getContent(BlogPost, username, slug);

  }

  /**
   * Gets a character.
   * 
   * Errors if the character doesn't exist.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @param {string} slug The unique slug of the character.
   * @returns {Character} The character.
   */
  async getCharacter(username = this.getUser().username, slug) {

    return this.getContent(Character, username, slug);

  }

  /**
   * Gets a piece of content.
   * 
   * Errors if the content doesn't exist.
   * @param {Art | BlogPost | Character} type The type of the content.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @param {string} slug The unique slug of the content.
   * @returns {Art | BlogPost | Character} The content.
   */
  async getContent(type, username = this.getUser().username, slug) {

    // Get the data from the API.
    const data = await this.requestREST(`contents/${type.apiDirectoryName}/${username}/${slug}`);
    
    // Create a BlogPost object from the data.
    return new type(data);

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
   * @param {string} [data.username] The user's username.
   * @param {string} [data.id] The user's unique ID.
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
   * @param {string} path The API endpoint.
   * @param {Object} [options] The options object to pass to the fetch request.
   * @param {string} [options.method] The method of the fetch request. Defaults to GET.
   * @param {Object} [options.headers] The headers to pass to the fetch request. Defaults to an empty object.
   * @param {Object} [options.body] The body to pass to the fetch request.
   * @returns {any}
   */
  async requestREST(path, {method = "GET", headers = {}, body} = {method: "GET", headers: {}}) {
    
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    const response = await fetch(`${this.endpoints.rest}${path}`, {
      headers: this.token ? {
        ...headers,
        token: this.token
      } : headers,
      signal: controller.signal,
      method,
      body
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
   * @param {Number} type A content type.
   * @returns {Art[] | BlogPost[] | Comment[] | Character[] | User[]} An array of content.
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
      const searchResults = await this.requestREST(`search?query=${query}`);

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
        throw new InvalidTokenError();

      default:
        throw new Error(message);

    }

  }

  async updateBlogPost(username = this.getUser().username, slug, details) {

    // Create FormData from the details.
    const formData = new FormData();
    const detailsKeys = Object.keys(details);
    for (let i = 0; detailsKeys.length; i++) {

      const key = detailsKeys[i];
      formData.append(key, details[key]);

    }

    // Send a request to the server to update the blog post.
    await this.requestREST(`contents/blog/${username}/${slug}`, {
      body: formData
    });

  }

}