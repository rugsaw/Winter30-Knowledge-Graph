import { API_BASE_PATH, URLS } from "../constants/url.constants";
import { apiService } from "./api.service";
import { messageBus } from "../utils/pubsub";

class KGService {

  generateKG(text) {
    const url = `${API_BASE_PATH}${URLS.KG_GENERATE}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = { text };

    const successHandler = (response) => {
        console.log('extracted knowledge graph:', response);
        messageBus.publish('app__kg', {
          event_name: 'KG_EXTRACTED_SUCCESS',
          data: response,
        });
    };

    const errorHandler = (error) => {
      console.error(error);
      messageBus.publish('app__kg', {
        event_name: 'KG_EXTRACTED_ERROR',
        data: error,
      });
    };

    apiService.postRequest(url, headers, JSON.stringify(body), successHandler, errorHandler);
  }

  getAllowedTypes() {
    const url = `${API_BASE_PATH}${URLS.KG_METADATA_ALLOWED_TYPES}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    const successHandler = (response) => {
      messageBus.publish('app__kg', {
        event_name: 'ALLOWED_TYPES_FETCHED_SUCCESS',
        data: response,
      });
    };

    const errorHandler = (error) => {
      console.error('Failed to fetch allowed types:', error);
      messageBus.publish('app__kg', {
        event_name: 'ALLOWED_TYPES_FETCHED_ERROR',
        data: error,
      });
    };

    apiService.getRequest(url, headers, successHandler, errorHandler);
  }

  queryKG(query) {
    const url = `${API_BASE_PATH}${URLS.KG_QUERY}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = { query };

    const successHandler = (response) => {
      console.log('KG query response:', response);
      messageBus.publish('app__kg', {
        event_name: 'KG_QUERY_SUCCESS',
        data: response,
      });
    };

    const errorHandler = (error) => {
      console.error('KG query failed:', error);
      messageBus.publish('app__kg', {
        event_name: 'KG_QUERY_ERROR',
        data: error,
      });
    };

    apiService.postRequest(url, headers, JSON.stringify(body), successHandler, errorHandler);
  }

  clearConversation() {
    const url = `${API_BASE_PATH}${URLS.CONVERSATION_CLEAR}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = {};

    const successHandler = (response) => {
      console.log('Conversation cleared:', response);
      messageBus.publish('app__kg', {
        event_name: 'CONVERSATION_CLEARED_SUCCESS',
        data: response,
      });
    };

    const errorHandler = (error) => {
      console.error('Failed to clear conversation:', error);
      messageBus.publish('app__kg', {
        event_name: 'CONVERSATION_CLEARED_ERROR',
        data: error,
      });
    };

    apiService.postRequest(url, headers, JSON.stringify(body), successHandler, errorHandler);
  }
}

const kgService = new KGService();
export { kgService };