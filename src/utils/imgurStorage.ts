import multer from 'multer';
import { ImgurClient } from 'imgur';
import { Request } from 'express';
import concat from 'concat-stream';

class ImgurStorage implements multer.StorageEngine {
  private client: ImgurClient;

  constructor(clientId: string, clientSecret: string) {
    this.client = new ImgurClient({ clientId, clientSecret });
  }

  // eslint-disable-next-line no-underscore-dangle
  async _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image files are allowed.'));
    }
    try {
      file.stream.pipe(concat((data) => {
        this.client.upload({ image: data }).then((response) => {
          callback(null, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            destination: file.destination,
            filename: response.data.id,
            path: response.data.link,
          });
        });
      }));
    } catch (e) {
      callback(e);
    }
    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this,no-underscore-dangle
  _removeFile(req: Request, file: Express.Multer.File, callback: (error: (Error | null)) => void) {
    callback(null);
  }
}

export default function imgurStorage(opts: { clientId: string, clientSecret: string }) {
  return new ImgurStorage(opts.clientId, opts.clientSecret);
}
