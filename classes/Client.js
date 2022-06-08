import { AccountBlockedError, AccountConflictError, BadCredentialsError, InvalidTokenError, UnallowedFileTypeError, UnderageError, UnknownError, UsernameFormatError } from "makuwro-errors";
import User from "./User.js";
import Art from "./Art.js";
import BlogPost from "./BlogPost.js";
import Character from "./Character.js";
import Story from "./Story.js";

/**
 * Represents a client.
 * @prop {object} endpoints An object of API endpoints.
 * @prop {object} endpoints.prod An object of production API endpoints.
 * @prop {string} endpoints.prod.rest The production REST API endpoint.
 * @prop {string} endpoints.prod.websocket The production websocket endpoint.
 * @prop {object} endpoints.dev An object of development API endpoints.
 * @prop {string} endpoints.dev.rest The development REST API endpoint.
 * @prop {string} endpoints.dev.websocket The development websocket endpoint. 
 * @prop {string} [token] The token of the user account.
 * @prop {number} timeout The maximum time in milliseconds that a request can take before it times out.
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

  /**
   * 
   * @param {*} username 
   * @returns 
   */
  async createArt(username) {

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
   * @param {string} username The owner of the content.
   * @returns 
   */
  async createContent(type, username, slug) {

    const data = await this.requestREST(`contents/${type.apiDirectoryName}/${username}${slug ? `/${slug}` : ""}`, {
      method: "POST"
    }, true);

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

    const response = await this.requestREST("accounts/user", {
      method: "POST",
      body: form
    });

    const data = await response.json();

    if (!response.ok) {

      Client.throwErrorFromObject(data);

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

    return await this.requestREST("accounts/user/sessions", {
      method: "POST",
      headers: {
        username,
        password
      }
    }, true);

  }

  /**
   * 
   * @since v1.0.0
   * @param {User | Team} accountType 
   * @param {string} username 
   * @param {string} password 
   */
  async deleteAccount(accountType, username, password) {

    await this.requestREST(`accounts/${accountType.apiDirectoryName}${username === (await this.getUser()).username ? "" : `s/${username}`}`, {
      method: "DELETE",
      headers: {password}
    });

  }

  /**
   * Requests the server to delete a piece of content.
   * 
   * The authenticated user must have access to the specified content; otherwise, this method will fail.
   * @since v1.0.0
   * @param {Art | BlogPost | Character | Comment | Story} contentType 
   * @param {string} username 
   * @param {string} slug 
   */
  async deleteContent(contentType, username, slug) {

    await this.requestREST(`contents/${contentType.apiDirectoryName}/${username}/${slug}`, {
      method: "DELETE"
    });

  }

  /**
   * Sends a request to revoke a session token.
   * @param {string} [token] The session token to revoke. Defaults to the current session token.
   */
  async deleteSessionToken(token = this.token) {

    await this.requestREST("accounts/user/sessions", {
      method: "DELETE",
      headers: {token}
    });

  }

  /**
   * 
   * @since v1.0.0
   * @param {User | Team} accountType 
   * @param {string} username 
   */
  async disableAccount(accountType, username, password) {

    await this.updateAccount(accountType, username, {isDisabled: true, password});

  }

  /**
   * Disconnects from the Makuwro gateway.
   * @since v1.0.0
   */
  async disconnect() {

    if (this.ws) {

      this.ws.close();

    }

  }

  /**
   * Gets all art that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {Art[]} An array of art.
   */
  async getAllArt(username = this.getUser().username) {

    return await this.getAllContent(Art, username);

  }

  /**
   * Gets all blog posts that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {BlogPost[]} An array of blog posts.
   */
  async getAllBlogPosts(username = this.getUser()) {

    return await this.getAllContent(BlogPost, username);

  }

  /**
   * Gets all characters that a user posted.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {string} [username] The user to search.
   * @returns {Character[]} An array of characters.
   */
  async getAllCharacters(username = this.getUser().username) {

    return await this.getAllContent(Character, username);

  }

  /**
   * Gets all of a type of content.
   * 
   * Returns an empty array if the user hasn't posted anything.
   * @param {Art | BlogPost | Character | Story} type The class of content to get.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @returns {Promise<Art[] | BlogPost[] | Character[] | Story[]>} An array of content.
   */
  async getAllContent(type, username = this.getUser().username) {

    const data = await this.requestREST(`contents/${type.apiDirectoryName}/${username}`);

    for (let i = 0; data.length > i; i++) {

      data[i] = new type(data[i]);

    }

    return data;

  }

  /**
   * 
   * @param {*} username 
   * @returns 
   */
  async getAllNotifications(username = this.getUser().username) {

    return await this.getAllContent(Notification, username);

  }

  /**
   * 
   * @param {*} username 
   * @returns 
   */
  async getAllStories(username = this.getUser().username) {

    return await this.getAllContent(Story, username);

  }

  /**
   * Gets a blog post.
   * 
   * Errors if the blog post doesn't exist.
   * @param {string} [username] The content owner's username. Defaults to the authenticated user's username.
   * @param {string} slug 
   * @returns {Promise<BlogPost>} The blog post.
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
   * @returns {Promise<Character>} The character.
   */
  async getCharacter(username = this.getUser().username, slug) {

    return this.getContent(Character, username, slug);

  }

  /**
   * Gets a piece of content.
   * 
   * Errors if the content doesn't exist.
   * @param {Art | BlogPost | Character} type The type of the content.
   * @param {string} username The content owner's username. 
   * @param {string} slug The unique slug of the content.
   * @returns {Promise<Art | BlogPost | Character>} The content.
   */
  async getContent(type, username, slug) {

    // Get the data from the API.
    const data = await this.requestREST(`contents/${type.apiDirectoryName}/${username}/${slug}`);
    
    // Use a constructor to create an object from the data.
    return new type(data, this);

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
   * @returns {Promise<User>} The desired user. 
   */
  async getUser({username, id} = {}) {

    // Check if we're getting ourselves.
    const self = (!username && !id) || (id && id === this.user?.id) || (username && username.toLowerCase() === this.user?.username.toLowerCase());
    if (self) {
      
      if (this.user) {
    
        // No need to waste an API call.
        return this.user;

      } else if (!this.token) {

        throw new InvalidTokenError();

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
   * 
   * @param {*} username 
   * @param {*} slug 
   * @returns 
   */
  async getStory(username, slug) {

    return await this.getContent(Story, username, slug);

  }

  /**
   * Sends a request to the Makuwro API.
   * @param {string} path The API endpoint.
   * @param {Object} [options] The options object to pass to the fetch request.
   * @param {string} [options.method] The method of the fetch request. Defaults to GET.
   * @param {Object} [options.headers] The headers to pass to the fetch request. Defaults to an empty object.
   * @param {Object} [options.body] The body to pass to the fetch request.
   * @returns {Promise<any>}
   */
  async requestREST(path, {method = "GET", headers = {}, body} = {method: "GET", headers: {}}, getJsonAnyway) {
    
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
    
    const data = !response.ok || (method === "GET" || getJsonAnyway) && await response.json();

    if (!response.ok) {

      Client.throwErrorFromObject(data);

    }

    return data;

  }

  /**
   * Searches for an error from a specified code, and then throws it with the error message as a parameter.
   * 
   * If the code is not found, an UnknownError object is thrown instead.
   * @param {number} object The error object data.
   * @returns {Error} The error. 
   */
  static throwErrorFromObject({code}) {

    switch (code) {

      case 0:
        throw new UnknownError();

      case 10000:
        throw new BadCredentialsError();

      case 10003:
        throw new AccountBlockedError();

      case 10004:
        throw new AccountConflictError();

      case 10012:
        throw new UnderageError();

      case 10013:
        throw new UsernameFormatError();

      default:
        throw new UnknownError();

    }

  }

  /**
   * Sends a request to the server to update an account.
   * 
   * Attempting to modify certain undocumented properties, such as `isStaff`, may cause the server to throw an error.
   * @since v1.0.0
   * @param {User | Team} accountType 
   * @param {string} username 
   * @param {object} props
   * @param {boolean} [props.isDisabled]
   * @param {string} [props.username]
   * @param {string} [props.email]
   * @param {number} [props.birthDate]
   * @param {string} [props.password]
   * @param {string} [props.terms]
   * @param {string} [props.css]
   * @param {string} [props.about]
   * @param {string} [props.displayName]
   */
  async updateAccount(accountType, username, props) {

    // Add all the fields to a FormData object.
    const formData = new FormData();
    const fieldsKeys = Object.keys(props);
    for (let i = 0; fieldsKeys.length > i; i++) {

      const key = fieldsKeys[i];
      formData.append(key, props[key]);

    }

    await this.requestREST(`accounts/${accountType.apiDirectoryName}${username === (await this.getUser()).username ? "" : `s/${username}`}`, {
      method: "PATCH",
      body: formData
    });

  }

  /**
   * 
   * @since v1.0.0
   * @param {Art | BlogPost | Character | Comment} contentType 
   * @param {string} username 
   * @param {string} slug 
   * @param {object} props
   * @param {string} [props.slug] 
   */
  async updateContent(contentType, username, slug, props) {

    // Add all the fields to a FormData object.
    const formData = new FormData();
    const keys = Object.keys(props);
    for (let i = 0; keys.length > i; i++) {

      const key = keys[i];
      formData.append(key, props[key]);

    }

    await this.requestREST(`contents/${contentType.apiDirectoryName}/${username}/${slug}`, {
      method: "PATCH",
      body: formData
    });

  }

  /**
   * 
   * @since v1.0.0
   * @param {string} username 
   * @param {string} slug 
   * @param {object} details 
   */
  async updateBlogPost(username, slug, details) {

    // Create FormData from the details.
    const formData = new FormData();
    const detailsKeys = Object.keys(details);
    for (let i = 0; detailsKeys.length > i; i++) {

      const key = detailsKeys[i];
      formData.append(key, details[key]);

    }

    // Send a request to the server to update the blog post.
    await this.requestREST(`contents/blogs/${username}/${slug}`, {
      body: formData,
      method: "PATCH"
    });

  }

  /**
   * Uploads an image to the Makuwro CDN.
   * 
   * Errors if the file is not an image, or if it fails the server's checks.
   * @since v1.0.0
   * @param {BlogPost} literatureType The literature class.
   * @param {string} literatureOwnerUsername The username of the literature's owner.
   * @param {string} literatureSlug The literature slug.
   * @param {File} file The image file.
   * @returns {Promise<string>} The path directing to the image.
   */
  async uploadImageToLiterature(literatureType, literatureOwnerUsername, literatureSlug, file) {

    // Try our best to verify that the file is an image.
    const checkImage = () => new Promise((resolve, reject) => {

      const image = new Image();
      image.onload = () => {

        // Revoke the URL to save memory.
        URL.revokeObjectURL(image.src);

        // It looks good, so let's send it to the server.
        resolve();

      };
      image.onerror = () => {

        // Revoke the URL to save memory.
        URL.revokeObjectURL(image.src);
        
        // The server will likely reject it anyway, so let's save that API call.
        reject(new UnallowedFileTypeError());

      };
      image.src = URL.createObjectURL(file);
 
    });

    // This should error if the file isn't an image.
    await checkImage();

    // Create form data as the body.
    const body = new FormData();
    body.append("image", file);

    // Send the request to the server.
    // If all goes well, this should return the image path.
    return await this.requestREST(`contents/${literatureType.apiDirectoryName}/${literatureOwnerUsername}/${literatureSlug}/images`, {
      method: "POST",
      body 
    }, true);

  }

}