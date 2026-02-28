import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StorageRepository } from '../../domain/storage.repository';
import { UploadFile } from '../../domain/file.interface';

@Injectable()
export class S3StorageRepository implements StorageRepository {
  private readonly client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  async uploadFile(file: UploadFile): Promise<string> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const key = `${Date.now()}-${file.originalname}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
