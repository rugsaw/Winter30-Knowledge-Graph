const processRequest = (
  url,
  requestOptions,
  successHandler,
  errorHandler,
  responseType = 'json'
) => {
  fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw { status: response.status, errorPromise: response.json() };
      } else {
        if (responseType == 'text') {
          return response.text();
        } else if (responseType == 'json') {
          return response.json();
        } else if (responseType == 'blob') {
          return response.blob();
        } else if (responseType == 'formData') {
          return response.formData();
        } else if (responseType == 'arrayBuffer') {
          return response.arrayBuffer();
        }
      }
    })
    .then((result) => successHandler(result))
    .catch((error) => errorHandler(error));
};

class APIService {
  getRequest(
    url,
    headers,
    successHandler,
    errorHandler,
    otherRequestOptions = {},
    responseType = 'json'
  ) {
    const requestOptions = {
      method: 'GET',
      headers: headers,
      ...otherRequestOptions,
    };

    processRequest(url, requestOptions, successHandler, errorHandler, responseType);
  }

  postRequest(
    url,
    headers,
    body,
    successHandler,
    errorHandler,
    otherRequestOptions = {},
    responseType = 'json'
  ) {
    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: body,
      ...otherRequestOptions,
    };

    processRequest(url, requestOptions, successHandler, errorHandler, responseType);
  }

  deleteRequest(
    url,
    headers,
    body,
    successHandler,
    errorHandler,
    otherRequestOptions = {},
    responseType = 'json'
  ) {
    const requestOptions = {
      method: 'DELETE',
      headers: headers,
      ...otherRequestOptions,
    };

    if (body) {
      requestOptions.body = body;
    }

    processRequest(url, requestOptions, successHandler, errorHandler, responseType);
  }

  putRequest(
    url,
    headers,
    body,
    successHandler,
    errorHandler,
    otherRequestOptions = {},
    responseType = 'json'
  ) {
    const requestOptions = {
      method: 'PUT',
      headers: headers,
      body: body,
      ...otherRequestOptions,
    };

    processRequest(url, requestOptions, successHandler, errorHandler, responseType);
  }

  patchRequest(
    url,
    headers,
    body,
    successHandler,
    errorHandler,
    otherRequestOptions = {},
    responseType = 'json'
  ) {
    const requestOptions = {
      method: 'PATCH',
      headers: headers,
      body: body,
      ...otherRequestOptions,
    };
    processRequest(url, requestOptions, successHandler, errorHandler, responseType);
  }
}

const apiService = new APIService();

export { apiService };
