import type { DataManager } from "@/managers/DataManager";

export class BaseService {
  protected _data: DataManager;
  constructor(data: DataManager) {
    this._data = data;
  }
}
