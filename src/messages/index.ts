export class ServiceQuery {
    constructor(host: string){
        this.host = host;
    }

    public host: string;
}

export class ServiceResponse {
    constructor(service: string, response: any){
        this.service = service;
        this.response = response;
    }

    public service: string;
    public response: any;
}