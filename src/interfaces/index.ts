import * as Bull from "bull";
import {ServiceQuery} from "../messages";

export interface IWorkerService extends IService {
    start(): void;
    stop(): void;
}

export interface IService {
    name: string;

    query(query: ServiceQuery): Promise<Bull.Job>;
}