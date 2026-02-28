import { UploadFile } from './file.interface';

export interface StorageRepository {
  uploadFile(file: UploadFile): Promise<string>;
}

export const STORAGE_REPOSITORY = 'STORAGE_REPOSITORY';
