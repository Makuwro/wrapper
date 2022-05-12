/**
 * @prop {string} id Represents the account ID
 * @prop {string} username Represents the account unique name
 */
 export default class Account {

  constructor(data, client) {

    // Save the account data.
    this.username = data.username;
    this.displayName = data.displayName;
    this.id = data.id;
    this.avatarPath = data.avatarPath;

    // Save the client.
    this.client = client;

  }

  async block() {



  }

  async delete() {

  }

  async disable() {



  }

  async follow() {



  }

  async getNotifications() {



  }

  static async search() {

    

  }

  async unblock() {



  }

  async unfollow() {

    

  }

  /**
   * Updates a user based on the 
   */
  async update({username}) {



  }

}