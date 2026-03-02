import { S3StorageRepository } from '../src/product/infrastructure/persistence/s3-storage.repository';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
}));

describe('S3StorageRepository', () => {
  let repo: S3StorageRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    repo = new S3StorageRepository();
  });

  it('debería estar definido', () => {
    expect(repo).toBeDefined();
  });

  describe('uploadFile', () => {
    it('debería subir un archivo y retornar la URL pública', async () => {
      mockSend.mockResolvedValue({});
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'foto.jpg',
        mimetype: 'image/jpeg',
        size: 100,
      };

      const url = await repo.uploadFile(file as any);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(url).toMatch(
        /^https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\//,
      );
      expect(url).toContain('foto.jpg');
    });

    it('debería propagar el error si S3 falla', async () => {
      mockSend.mockRejectedValue(new Error('S3 error'));
      const file = {
        buffer: Buffer.from('x'),
        originalname: 'f.jpg',
        mimetype: 'image/jpeg',
        size: 1,
      };
      await expect(repo.uploadFile(file as any)).rejects.toThrow('S3 error');
    });
  });
});
