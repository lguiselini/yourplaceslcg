//class => blueprint for a javascript object
//extends keyword to "modify" the funcionality of the "Error" to behave the way we want
//adding the constructor method to this class to run some logic
class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // add a "message" property
    this.code = errorCode; // adds a "code" property 
  }
}

module.exports = HttpError;
