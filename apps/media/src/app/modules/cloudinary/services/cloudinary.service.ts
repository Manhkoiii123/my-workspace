import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly cloudinary = cloudinary;

  constructor(private readonly configService: ConfigService) {
    this.cloudinary.config({
      cloud_name: this.configService.get<string>(
        'CLOUDINARY_CONFIG.CLOUD_NAME'
      ),
      api_key: this.configService.get<string>('CLOUDINARY_CONFIG.API_KEY'),
      api_secret: this.configService.get<string>(
        'CLOUDINARY_CONFIG.API_SECRET'
      ),
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder: 'einvoice-app', resource_type: 'auto', public_id: fileName },
        (error, result) => {
          if (error) {
            console.error('Error uploading file:', error);
            return reject(error);
          }
          console.log('File uploaded successfully:', result);
          return resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
}
