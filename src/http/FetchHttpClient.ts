import { assert } from "../assertions";
import { EnumValue } from "../types";
import { HttpClient, HttpRequest, HttpResponse, HttpStatusCodes, MethodlessHttpRequest } from "./types";
import { isValidStatus } from "./validators";

export class FetchHttpClient implements HttpClient {
    send(request: HttpRequest): Promise<HttpResponse> {
        return fetch(...FetchHttpClient.adaptToFetchRequest(request))
            .then(FetchHttpClient.adaptToFetchResponse);
    }

    get(request: MethodlessHttpRequest): Promise<HttpResponse> {
       return this.send({...request, method: 'GET'}) ;
    }
    post(request: MethodlessHttpRequest): Promise<HttpResponse> {
        return this.send({...request, method: 'POST'});
    }
    put(request: MethodlessHttpRequest): Promise<HttpResponse> {
       return this.send({...request, method: 'PUT'}) ;
    }
    patch(request: MethodlessHttpRequest): Promise<HttpResponse> {
        return this.send({...request, method: 'PATCH'});
    }
    delete(request: MethodlessHttpRequest): Promise<HttpResponse> {
        return this.send({...request, method: 'DELETE'});
    }
    head(request: MethodlessHttpRequest): Promise<HttpResponse> {
        return this.send({...request, method: 'HEAD'});
    }

    private static adaptToFetchRequest(request: HttpRequest): [string, RequestInit] {
        return [
            request.url,
            {
                body: request.body,
                headers: request.headers,
                method: request.method,
            },
        ];
    }

    private static adaptToFetchResponse(response: Response): HttpResponse {
        return {
            headers: () => new Map(response.headers?.entries() ?? []),
            body: () => response.text(),
            code: () => {
                assert(isValidStatus(response.status), 'A valid response code is required for HttpResponse');

                return response.status as EnumValue<typeof HttpStatusCodes>;
            },
        }
    }
}