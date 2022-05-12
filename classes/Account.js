/**
 * @prop {string} id Represents the account ID
 * @prop {string} username Represents the account unique name
 */
export class Account {

  constructor(data, client) {

    this.username = data.username;
    this.displayName = data.displayName;
    this.id = data.id;
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