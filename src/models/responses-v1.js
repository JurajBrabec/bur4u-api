class Response {
  constructor() {
    this.timeStamp = Date.now();
  }
}

class ErrorResponse extends Response {
  constructor(error) {
    super();
    this.error = error.message || error;
  }
}

module.exports = {
  Response,
  Error: (data) => new ErrorResponse(data),
};
